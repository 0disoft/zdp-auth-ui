# Auth Surface Model Contract

`createZdpAuthSurfaceModel`은 제품이 신뢰한 feature configuration을 공통 `AuthShell` 입력과 locale별 provider 목록으로 조립하는 순수 함수다. 제품마다 provider label, 표시 순서, recovery link 조건을 다시 구현하지 않게 하는 것이 목적이다.

```svelte
<script lang="ts">
  import {
    AuthShell,
    createZdpAuthSurfaceModel,
    type ZdpAuthAvailability,
    type ZdpAuthMode
  } from 'zdp-auth-ui';

  let locale = 'ko';
  let mode: ZdpAuthMode = 'login';
  let availability: ZdpAuthAvailability = 'available';

  $: surface = createZdpAuthSurfaceModel({
    locale,
    mode,
    availability,
    accountBrand: 'ZDP',
    providerFlags: {
      passkey: true,
      google: true,
      email: true
    },
    links: {
      recoveryHref: '/account/recovery',
      termsHref: '/terms',
      privacyHref: '/privacy'
    }
  });
</script>

<AuthShell {...surface.shell}>
  <!-- consumer-owned fields -->
</AuthShell>
```

Built-in provider 순서는 `passkey`, `google`, `github`, `email`로 고정한다. flag가 `true`인 provider만 locale catalog label과 provider kind를 붙여 반환한다. recovery mode에서는 provider 목록과 recovery link를 비워 로그인·회원가입용 선택지가 섞이지 않게 한다. 빈 link 문자열은 `null`로 정규화한다.

이 모델은 display composition만 소유한다. provider enablement 값과 link는 consuming app이 신뢰된 배포 설정에서 공급해야 한다. 함수는 auth origin이나 URL을 신뢰 목록에 올리지 않고, endpoint를 호출하지 않으며, session·token·credential·permission 상태를 읽거나 저장하지 않는다. submit 상태, server error mapping, callback, native form action, referral 값도 consuming app 책임으로 남는다.
