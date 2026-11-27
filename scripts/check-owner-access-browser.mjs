import assert from 'node:assert/strict';

export async function checkOwnerAccessCeremonies(page) {
  await page.evaluate(() => {
    window.ownerFixtureNativeCalls = 0;
    window.ownerFixtureNativeAborts = 0;
    const original = navigator.credentials.get;
    window.restoreOwnerFixtureCredentials = () => { navigator.credentials.get = original; };
    navigator.credentials.get = ({ signal }) => new Promise((_, reject) => {
      window.ownerFixtureNativeCalls++;
      signal.addEventListener('abort', () => {
        window.ownerFixtureNativeAborts++;
        reject(signal.reason);
      }, { once: true });
    });
    window.mountOwnerAccessFixture();
  });
  const fixture = page.getByTestId('owner-access-fixture');
  const button = (name) => fixture.getByRole('button', { name, exact: true });
  const toggle = button('Toggle owner panel');
  const nativeCalls = (expected) => page.waitForFunction(value => window.ownerFixtureNativeCalls === value, expected);
  try {
    await button('Start other passkey prompt').click();
    await nativeCalls(1);
    await toggle.click();
    assert.equal(await fixture.getByTestId('other-prompt-result').textContent(), 'pending',
      'Destroying an idle owner panel must leave another surface’s prompt active.');
    await button('Cancel other passkey prompt').click();
    await page.waitForFunction(() => window.ownerFixtureNativeAborts === 1);

    await toggle.click();
    const veto = button('Cancel with current owner passkey');
    await veto.click();
    await nativeCalls(2);
    await toggle.click();
    await page.waitForFunction(() => window.ownerFixtureNativeAborts === 2);

    await toggle.click();
    await button('Delay ceremony preparation').click();
    await veto.click();
    await toggle.click();
    await button('Finish ceremony preparation').click();
    assert.equal(await fixture.getByTestId('owner-ceremony-requests').textContent(), '1',
      'A preparation result arriving after owner panel teardown must not open a new prompt.');
  } finally {
    await page.evaluate(() => window.restoreOwnerFixtureCredentials());
  }
}
