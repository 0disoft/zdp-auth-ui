export interface ZdpManagedPasskey {
  readonly passkey_id: string;
  readonly label: string;
  readonly created_at: string;
  readonly last_used_at: string | null;
}

export interface ZdpPasskeySettingsState {
  readonly status: 'ready' | 'preparing' | 'unavailable';
  readonly passkeys: readonly ZdpManagedPasskey[];
  readonly capabilities: { readonly register: boolean; readonly rename: boolean; readonly revoke: boolean };
  readonly reauthentication: 'password' | 'passkey';
}

export type ZdpPasskeySettingsAction =
  | { readonly action: 'register'; readonly label: string; readonly currentPassword?: string }
  | { readonly action: 'rename'; readonly passkeyId: string; readonly label: string }
  | { readonly action: 'revoke'; readonly passkeyId: string; readonly currentPassword?: string };

export type ZdpPasskeySettingsFeedback = 'saved' | 'failed' | 'unconfirmed' | 'expired' | 'rate_limited' | null;

export function validPasskeyLabel(value: string): boolean {
  const label = value.trim();
  return Array.from(label).length >= 1 && Array.from(label).length <= 80 && !/\p{Cc}/u.test(label);
}
