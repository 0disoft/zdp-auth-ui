import assert from 'node:assert/strict';

export async function checkPasskeyEditorFocus(page, passkeyReauth) {
  const reauthPassword = passkeyReauth.locator('#reauth-settings-password');
  const editor = passkeyReauth.locator('.zdp-passkey-settings__editor');
  const confirmTitle = editor.locator('legend');
  const cancelRemoval = editor.getByRole('button', { name: 'Cancel', exact: true });
  async function assertFocused(locator, reason) {
    const target = await locator.elementHandle();
    assert.ok(target, reason);
    try {
      await page.waitForFunction((element) => document.activeElement === element, target);
      assert.equal(await locator.evaluate((element) => document.activeElement === element), true, reason);
    } finally {
      await target.dispose();
    }
  }
  async function cancelWithKeyboard(origin) {
    await assertFocused(confirmTitle, 'Passkey-only removal must focus its confirmation title instead of leaving focus in the list.');
    assert.equal(await editor.locator('input').count(), 0);
    await page.keyboard.press('Tab');
    await assertFocused(cancelRemoval, 'The next Tab must reach Cancel without visiting other rows.');
    await page.keyboard.press('Enter');
    await editor.waitFor({ state: 'detached' });
    await assertFocused(origin, 'Keyboard cancellation must restore the original row control.');
  }
  await passkeyReauth.getByTestId('use-passkey').click();
  const firstRemove = passkeyReauth.locator('li').first().getByRole('button', { name: 'Remove', exact: true });
  await firstRemove.focus();
  await page.keyboard.press('Enter');
  assert.equal(await confirmTitle.textContent(), 'Remove: First key');
  await cancelWithKeyboard(firstRemove);

  await passkeyReauth.getByTestId('use-password').click();
  await firstRemove.focus();
  await page.keyboard.press('Enter');
  await assertFocused(reauthPassword, 'Password removal must still focus its required password input.');
  await cancelRemoval.press('Enter');
  await assertFocused(firstRemove, 'Password cancellation must also restore its row control.');

  await passkeyReauth.getByTestId('use-passkey').click();
  await passkeyReauth.getByTestId('directory-layout').click();
  const firstMenu = passkeyReauth.getByRole('button', { name: 'First key · Passkeys & security keys', exact: true });
  async function openRemovalMenu(trigger) {
    await trigger.focus();
    await page.keyboard.press('ArrowUp');
    const removeItem = passkeyReauth.getByRole('menuitem', { name: 'Remove', exact: true });
    await assertFocused(removeItem, 'The directory menu must support keyboard removal selection.');
    await page.keyboard.press('Enter');
    await assertFocused(confirmTitle, 'Menu removal must enter the confirmation region.');
  }
  await openRemovalMenu(firstMenu);
  await cancelWithKeyboard(firstMenu);

  await openRemovalMenu(firstMenu);
  await passkeyReauth.getByTestId('remove-first-key').evaluate((element) => element.click());
  await editor.waitFor({ state: 'detached' });
  assert.equal(await passkeyReauth.locator('li').count(), 2);
  const settingsRegion = passkeyReauth.getByRole('region', { name: 'Passkeys & security keys', exact: true });
  await assertFocused(settingsRegion, 'Removing the selected key externally must move focus to the surviving settings region.');

  await openRemovalMenu(passkeyReauth.getByRole('button', { name: 'Second key · Passkeys & security keys', exact: true }));
  await passkeyReauth.getByTestId('clear-passkeys').evaluate((element) => element.click());
  await editor.waitFor({ state: 'detached' });
  assert.equal(await passkeyReauth.locator('li').count(), 0);
  await assertFocused(settingsRegion, 'An empty list must still retain a safe focus target.');
}
