# Auth Surface Model Contract

`createZdpAuthSurfaceModel`은 제품이 신뢰한 feature configuration을 공통 `AuthShell` 입력과 locale별 provider 목록으로 조립하는 순수 함수다. 제품마다 provider label, 표시 순서, recovery link 조건을 다시 구현하지 않게 하는 것이 목적이다. 반환값은 `{ messages, shell }`이고, provider 순서·recovery mode 처리·link 정규화·동결 동작은 root entry와 components entry가 같다.

## Root entry

`zdp-auth-ui`가 export하는 `ZdpAuthSurfaceConfig`는 `messages?: ZdpAuthMessages`를 선택 입력으로 받는다. 넘긴 messages는 그대로 쓰고, 넘기지 않으면 기존처럼 `getAuthMessages(locale)` 동기 카탈로그로 폴백한다. root 함수는 이 폴백을 위해 `zdp-auth-ui/i18n` 동기 카탈로그를 계속 import하므로 messages를 주입해도 전체 카탈로그 의존은 남는다. 기존 호출부를 그대로 두려는 소비 앱은 이 entry를 쓴다.

## Components entry

`zdp-auth-ui/components`는 같은 이름의 `createZdpAuthSurfaceModel`과 `ZdpAuthSurfaceConfig`, `ZdpAuthSurfaceModel`, `ZdpAuthSurfaceShellModel`, `ZdpAuthSurfaceLinks`, `ZdpAuthSurfaceProviderFlags`, `ZdpAuthSurfaceProviderId`, `zdpAuthSurfaceProviderIds`를 export한다. 이 entry의 `messages`는 필수라서 카탈로그를 어디서 가져올지 소비 앱이 정한다.

- `zdp-auth-ui/i18n/<locale>`을 고정 import한 카탈로그, 또는
- route load나 async bootstrap에서 `await loadAuthLocale(locale)`을 먼저 호출해 받은 `.messages`

둘 중 하나를 `messages`에 넘기면 전체 동기 카탈로그를 import하지 않는다. `messages`가 빠지면 타입 단계에서 막히고, 컴포넌트는 카탈로그를 직접 읽지 않는다.

```svelte
<script lang="ts">
  import { AuthShell, createZdpAuthSurfaceModel } from 'zdp-auth-ui/components';
  import koMessages from 'zdp-auth-ui/i18n/ko';

  let mode = $state<'login' | 'signup' | 'recovery'>('login');

  const surface = $derived(
    createZdpAuthSurfaceModel({
      locale: 'ko',
      messages: koMessages,
      mode,
      availability: 'available',
      accountBrand: 'ZDP',
      providerFlags: { passkey: true, google: true, email: true },
      links: {
        recoveryHref: '/account/recovery',
        termsHref: '/terms',
        privacyHref: '/privacy'
      }
    })
  );
</script>

<AuthShell {...surface.shell} messages={surface.messages} />
```

Lean `AuthShell`은 `messages`가 필수 prop이라서 surface를 스프레드한 뒤 messages를 따로 넘긴다. 런타임에 locale을 고르는 앱은 route load나 async bootstrap에서 로더를 먼저 await하고, 그 결과의 `messages`를 같은 자리에 넘긴다. root `AuthShell`의 `messages` prop은 계속 선택이라서 root entry만 쓰는 소비 앱은 messages를 넘기지 않아도 된다.

Built-in provider 순서는 `passkey`, `google`, `github`, `email`로 고정한다. flag가 `true`인 provider만 주입된 catalog label과 provider kind를 붙여 반환한다. recovery mode에서는 provider 목록과 recovery link를 비워 로그인·회원가입용 선택지가 섞이지 않게 한다. 빈 link 문자열은 `null`로 정규화한다.

이 모델은 display composition만 소유한다. provider enablement 값과 link는 consuming app이 신뢰된 배포 설정에서 공급해야 한다. 함수는 auth origin이나 URL을 신뢰 목록에 올리지 않고, endpoint를 호출하지 않으며, session·token·credential·permission 상태를 읽거나 저장하지 않는다. submit 상태, server error mapping, callback, native form action, referral 값도 consuming app 책임으로 남는다.
