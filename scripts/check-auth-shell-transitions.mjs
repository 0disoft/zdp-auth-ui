import assert from 'node:assert/strict';

export async function checkAuthShellTransitions(page) {
  await page.evaluate(() => {
    globalThis.__authShellTransitions = globalThis.mountAuthShellTransitionsFixture();
  });
  const fixture = page.getByTestId('auth-shell-transitions');
  const form = fixture.locator('form');
  const submit = async () => {
    await form.evaluate(element => element.requestSubmit());
    return JSON.parse(await fixture.locator('output').textContent());
  };
  assert.deepEqual(await submit(), {
    mode: 'signup', referralCode: 'invitation', fields: [['referral_code', 'invitation']]
  });

  for (const mode of ['login', 'recovery', 'signup']) {
    await page.evaluate(mode => globalThis.__authShellTransitions.update(mode, '  invitation  ', 'invite'), mode);
    const signup = mode === 'signup';
    assert.deepEqual(await submit(), {
      mode, referralCode: signup ? 'invitation' : null, fields: signup ? [['invite', 'invitation']] : []
    }, `${mode} callback detail must agree with the native form's signup-only referral field.`);
  }
  await page.evaluate(() => globalThis.__authShellTransitions.update('signup', '   '));
  assert.deepEqual(await submit(), { mode: 'signup', referralCode: null, fields: [] });
  await page.evaluate(() => globalThis.__authShellTransitions.update('signup', 'invitation', '  '));
  assert.deepEqual(await submit(), {
    mode: 'signup', referralCode: 'invitation', fields: [['referral_code', 'invitation']]
  });
}
