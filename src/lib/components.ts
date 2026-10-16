import type { ComponentProps } from 'svelte';

export { default as AuthShell } from './components/AuthShell.svelte';
export { default as LoginIdField } from './components/LoginIdField.svelte';
export { default as PasswordField } from './components/PasswordField.svelte';
export { default as PasswordSignupFields } from './components/PasswordSignupFields.svelte';
export { default as ProductLinkApproval } from './components/ProductLinkApproval.svelte';
export { default as PasskeySettings } from './components/PasskeySettings.svelte';
export { default as ProviderButton } from './components/ProviderButton.svelte';
export type { ZdpAuthLocale, ZdpAuthMessages } from './i18n';
export type { ZdpPasskeySettingsMessages } from './passkey-settings-messages';

export type AuthShellProps = ComponentProps<typeof import('./components/AuthShell.svelte').default>;
export type LoginIdFieldProps = ComponentProps<typeof import('./components/LoginIdField.svelte').default>;
export type PasswordFieldProps = ComponentProps<typeof import('./components/PasswordField.svelte').default>;
export type PasswordSignupFieldsProps = ComponentProps<typeof import('./components/PasswordSignupFields.svelte').default>;
export type ProductLinkApprovalProps = ComponentProps<typeof import('./components/ProductLinkApproval.svelte').default>;
export type ProviderButtonProps = ComponentProps<typeof import('./components/ProviderButton.svelte').default>;
export type PasskeySettingsProps = ComponentProps<typeof import('./components/PasskeySettings.svelte').default>;
