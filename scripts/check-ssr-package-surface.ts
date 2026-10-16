import { render } from 'svelte/server';
import type { Component } from 'svelte';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { AuthShell, LoginIdField } = await import(pathToFileURL(resolve('dist/index.server.js')).href) as {
  AuthShell: Component<Record<string, unknown>>;
  LoginIdField: Component<Record<string, unknown>>;
};

const { body: autofillBody } = render(LoginIdField, {
  props: { id: 'passkey-login', name: 'login_id', autocomplete: 'username webauthn' }
});
if (!autofillBody.includes('autocomplete="username webauthn"')) {
  throw new Error('LoginIdField must render the conditional passkey autocomplete attribute.');
}

const preparingMessage = '계정 서비스는 아직 준비 중입니다.';
const recoveryLabel = '비밀번호를 잊었어요';
const accountSummary = 'ZDP 계정으로 계속합니다.';
const { body } = render(AuthShell, {
  props: {
    locale: 'ko',
    mode: 'login',
    availability: 'preparing',
    accountBrand: 'ZDP'
  }
});

if (!body.includes(preparingMessage)) {
  throw new Error('SSR package surface must render the Korean preparing state.');
}

if (!body.includes(accountSummary) || body.includes('8ailors 계정으로 계속합니다.')) {
  throw new Error('SSR package surface must render the consumer-supplied account brand.');
}

if (body.includes(recoveryLabel) || body.includes('href="?mode=recovery"')) {
  throw new Error('SSR package surface must fail closed without an active recovery link while preparing.');
}

if (!body.includes('disabled')) {
  throw new Error('SSR package surface must render a disabled submit control while preparing.');
}

process.stdout.write('zdp-auth-ui SSR package surface check passed\n');

const lean = await import(pathToFileURL(resolve('dist/components.server.js')).href) as {
  AuthShell: Component<Record<string, unknown>>;
  PasskeySettings: Component<Record<string, unknown>>;
};
const { loadAuthLocale } = await import('../dist/i18n/loader.js');
const catalog = await loadAuthLocale('ko');
const leanShell = render(lean.AuthShell, { props: {
  locale: catalog.locale, messages: catalog.messages, availability: 'preparing'
} });
if (!leanShell.body.includes(preparingMessage) || !leanShell.body.includes('disabled')) {
  throw new Error('Lean SSR must render the injected locale synchronously and preserve availability.');
}
const leanSettings = render(lean.PasskeySettings, { props: {
  locale: catalog.locale, messages: catalog.passkeySettingsMessages, authMessages: catalog.messages
} });
if (!leanSettings.body.includes(catalog.passkeySettingsMessages.preparing)) {
  throw new Error('Lean passkey settings SSR must render the injected settings catalog.');
}
process.stdout.write('zdp-auth-ui injected locale SSR check passed\n');
