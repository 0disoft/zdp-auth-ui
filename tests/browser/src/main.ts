import { mount } from 'svelte';
import '../../../src/styles/index.css';
import AuthBrowserFixture from './AuthBrowserFixture.svelte';
import AuthFeedbackFixture from './AuthFeedbackFixture.svelte';

mount(AuthBrowserFixture, {
  target: document.getElementById('app') as HTMLElement
});

const feedbackTarget = document.createElement('div');
feedbackTarget.id = 'auth-feedback-app';
document.body.append(feedbackTarget);

mount(AuthFeedbackFixture, {
  target: feedbackTarget
});
