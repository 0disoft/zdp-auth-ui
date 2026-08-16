import { render } from 'svelte/server';
import { AuthShell } from '../dist/index.server.js';

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
