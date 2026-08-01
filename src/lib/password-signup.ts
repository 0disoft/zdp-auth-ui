import { zdpAuthTargetLocales, type ZdpAuthLocale } from './i18n';

export const zdpPasswordSignupFieldNames = Object.freeze({
  loginId: 'login_id',
  password: 'password',
  termsAccepted: 'terms_accepted',
  termsConsentRef: 'terms_consent_ref',
  locale: 'locale'
} as const);

export interface ZdpPasswordSignupContractRequest {
  readonly termsConsentRef: string;
  readonly locale: ZdpAuthLocale | string;
}

export interface ZdpPasswordSignupContract {
  readonly termsConsentRef: string;
  readonly locale: ZdpAuthLocale;
  readonly fieldNames: typeof zdpPasswordSignupFieldNames;
}

export type ZdpPasswordSignupContractResult =
  | { readonly outcome: 'created'; readonly contract: ZdpPasswordSignupContract }
  | { readonly outcome: 'rejected'; readonly reason: 'invalid-terms-consent-ref' | 'unsupported-locale' };

export function createZdpPasswordSignupContract(
  request: ZdpPasswordSignupContractRequest
): ZdpPasswordSignupContractResult {
  const termsConsentRef = request.termsConsentRef.trim();
  if (!isSafeReference(termsConsentRef, 256)) {
    return { outcome: 'rejected', reason: 'invalid-terms-consent-ref' };
  }
  if (!(zdpAuthTargetLocales as readonly string[]).includes(request.locale)) {
    return { outcome: 'rejected', reason: 'unsupported-locale' };
  }
  return {
    outcome: 'created',
    contract: {
      termsConsentRef,
      locale: request.locale as ZdpAuthLocale,
      fieldNames: zdpPasswordSignupFieldNames
    }
  };
}

function isSafeReference(value: string, maximumLength: number): boolean {
  return value.length > 0
    && value.length <= maximumLength
    && [...value].every((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code >= 0x21 && code <= 0x7e && character !== ',' && character !== ';';
    });
}
