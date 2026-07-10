import { mount } from 'svelte';
import '../../../src/styles/index.css';
import AuthBrowserFixture from './AuthBrowserFixture.svelte';

mount(AuthBrowserFixture, {
  target: document.getElementById('app') as HTMLElement
});
