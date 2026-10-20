import assert from 'node:assert/strict';

export async function checkPasskeyPolicyFocus(page) {
  for (const shadow of [false, true]) await checkPolicyFocus(page, shadow);
}

async function checkPolicyFocus(page, shadow) {
  await page.evaluate(shadow => {
    globalThis.__passkeyPolicy = globalThis.mountPasskeyPolicyFixture(shadow);
  }, shadow);
  const fixture = page.getByTestId('passkey-policy-fixture').last();
  const editor = fixture.locator('.zdp-passkey-settings__editor');
  const password = editor.locator('input[name="current_password"]');
  const update = patch => page.evaluate(patch => globalThis.__passkeyPolicy.update(patch), patch);
  const focused = locator => locator.evaluate(element => element.getRootNode().activeElement === element);
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));

  await fixture.locator('li').getByRole('button', { name: 'Remove', exact: true }).click();
  await password.fill('temporary-password');
  await update({ reauthentication: 'passkey' });
  await password.waitFor({ state: 'detached' }); await settle();
  assert.equal(await focused(editor.locator('legend')), true,
    'Removing a focused password input must retain keyboard focus in its confirmation editor.');
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();

  await update({ reauthentication: 'password' });
  await fixture.locator('header button').click();
  await password.fill('temporary-password');
  await update({ reauthentication: 'passkey' }); await settle();
  assert.equal(await focused(editor.locator('input[name="label"]')), true,
    'Registration must retain focus in its surviving name field.');
  await update({ reauthentication: 'password' });
  assert.equal(await password.inputValue(), '', 'A removed password must not return when policy changes back.');
  const outside = fixture.getByTestId('policy-outside');
  await password.fill('another-password');
  await page.evaluate(() => globalThis.__passkeyPolicy.updateThenFocusOutside({ reauthentication: 'passkey' }));
  await settle();
  assert.equal(await focused(outside), true, 'Pending focus recovery must respect a newer focus move outside the editor.');
  await update({ capabilities: { register: false, rename: true, revoke: true } });
  await editor.waitFor({ state: 'detached' });
  assert.equal(await fixture.locator('output').textContent(), '', 'Policy changes must not emit an action.');
}
