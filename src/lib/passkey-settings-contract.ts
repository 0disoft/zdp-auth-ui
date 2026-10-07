export const zdpPasskeyAuthenticatorProviders = [
  'windows_hello',
  'google_password_manager',
  'bitwarden',
  'apple_passwords',
  'unknown'
] as const;
export type ZdpPasskeyAuthenticatorProvider = (typeof zdpPasskeyAuthenticatorProviders)[number];

export const zdpPasskeyAuthenticatorStorages = ['synced', 'device_bound'] as const;
export type ZdpPasskeyAuthenticatorStorage = (typeof zdpPasskeyAuthenticatorStorages)[number];

export interface ZdpPasskeyAuthenticator {
  readonly provider: ZdpPasskeyAuthenticatorProvider;
  readonly storage: ZdpPasskeyAuthenticatorStorage;
  readonly backed_up: boolean;
}

export interface ZdpManagedPasskey {
  readonly passkey_id: string;
  readonly label: string;
  readonly created_at: string;
  readonly last_used_at: string | null;
  readonly authenticator?: ZdpPasskeyAuthenticator;
}

export const zdpPasskeyRegistrationPreferences = ['device', 'manager', 'security_key', 'phone'] as const;
export type ZdpPasskeyRegistrationPreference = (typeof zdpPasskeyRegistrationPreferences)[number];

export const zdpPasskeyRegistrationPreferenceDefault: ZdpPasskeyRegistrationPreference = 'device';

export interface ZdpPasskeySettingsState {
  readonly status: 'ready' | 'preparing' | 'unavailable';
  readonly passkeys: readonly ZdpManagedPasskey[];
  readonly capabilities: { readonly register: boolean; readonly rename: boolean; readonly revoke: boolean };
  readonly reauthentication: 'password' | 'passkey';
}

export type ZdpPasskeySettingsAction =
  | { readonly action: 'register'; readonly label: string;
      readonly preference?: ZdpPasskeyRegistrationPreference; readonly currentPassword?: string }
  | { readonly action: 'rename'; readonly passkeyId: string; readonly label: string }
  | { readonly action: 'revoke'; readonly passkeyId: string; readonly currentPassword?: string };

export type ZdpPasskeySettingsFeedback = 'saved' | 'failed' | 'unconfirmed' | 'expired' | 'rate_limited' | null;

export function validPasskeyLabel(value: string): boolean {
  const label = value.trim();
  return Array.from(label).length >= 1 && Array.from(label).length <= 80 && !/\p{Cc}/u.test(label);
}

export function isZdpPasskeyAuthenticatorProvider(value: unknown): value is ZdpPasskeyAuthenticatorProvider {
  return typeof value === 'string' && (zdpPasskeyAuthenticatorProviders as readonly string[]).includes(value);
}

export function isZdpPasskeyAuthenticatorStorage(value: unknown): value is ZdpPasskeyAuthenticatorStorage {
  return typeof value === 'string' && (zdpPasskeyAuthenticatorStorages as readonly string[]).includes(value);
}

export function isZdpPasskeyRegistrationPreference(value: unknown): value is ZdpPasskeyRegistrationPreference {
  return typeof value === 'string' && (zdpPasskeyRegistrationPreferences as readonly string[]).includes(value);
}
