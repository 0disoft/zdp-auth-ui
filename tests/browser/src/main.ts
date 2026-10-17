import { mount } from 'svelte';
import '../../../src/styles/index.css';
import AuthBrowserFixture from './AuthBrowserFixture.svelte';
import AuthFeedbackFixture from './AuthFeedbackFixture.svelte';
import PasskeyReauthFixture from './PasskeyReauthFixture.svelte';

mount(AuthBrowserFixture, {
  target: document.getElementById('app') as HTMLElement
});

const feedbackTarget = document.createElement('div');
feedbackTarget.id = 'auth-feedback-app';
document.body.append(feedbackTarget);

mount(AuthFeedbackFixture, {
  target: feedbackTarget
});

Object.assign(window, {
  mountShadowPasskeyFixture() {
    const host = document.createElement('div');
    host.id = 'shadow-passkey-host';
    document.body.append(host);
    const instance = mount(PasskeyReauthFixture, {
      target: host.attachShadow({ mode: 'open' }),
      props: { testId: 'shadow-passkey-reauth-fixture' }
    });
    return instance;
  }
});
