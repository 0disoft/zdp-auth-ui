import assert from 'node:assert/strict';

export async function checkFormResetLifecycle(page, root) {
  const result = await page.evaluate(async moduleUrl => {
    const { onInputFormReset } = await import(/* @vite-ignore */ moduleUrl);
    const task = () => new Promise(resolve => setTimeout(resolve, 0));
    const form = document.createElement('form');
    const input = document.createElement('input');
    form.append(input); document.body.append(form);
    let calls = 0;
    const stop = onInputFormReset(input, () => { calls++; });
    form.reset(); stop(); await task();
    const afterDestroy = calls;
    form.reset(); await task();
    const afterUnsubscribedReset = calls;
    const stop2 = onInputFormReset(input, () => { calls++; });
    const host = document.createElement('div'); document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    form.remove(); await task(); shadow.append(form); await task();
    form.reset(); await task();
    const afterShadowReset = calls;
    form.addEventListener('reset', event => event.preventDefault(), { once: true });
    form.reset(); await task();
    const afterCancelledReset = calls;
    form.remove(); await task(); document.body.append(form); await task();
    form.reset(); await task();
    const afterDocumentReset = calls;
    const external = document.createElement('form');
    external.id = 'reset-lifecycle-external-owner'; document.body.append(external);
    input.setAttribute('form', external.id);
    // Reset immediately: following form ownership must not depend on an observer turn.
    external.reset(); await task();
    const afterExternalReset = calls;
    form.reset(); await task();
    const afterFormerOwnerReset = calls;
    external.reset(); stop2(); await task();
    const afterExternalDestroy = calls;
    form.remove(); external.remove(); host.remove();
    return { afterDestroy, afterUnsubscribedReset, afterShadowReset, afterCancelledReset,
      afterDocumentReset, afterExternalReset, afterFormerOwnerReset, afterExternalDestroy };
  }, `/@fs/${root.replaceAll('\\', '/')}/src/lib/form-reset.ts`);
  assert.deepEqual(result, {
    afterDestroy: 0, afterUnsubscribedReset: 0, afterShadowReset: 1, afterCancelledReset: 1,
    afterDocumentReset: 2, afterExternalReset: 3, afterFormerOwnerReset: 3, afterExternalDestroy: 3
  }, 'Reset subscriptions must follow reconnected forms, deduplicate delivery, and cancel work on destroy.');
}
