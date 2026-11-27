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

export async function checkOwnerAccessApprovalExpiry(page) {
  const fixture = page.getByTestId('owner-access-fixture');
  const button = (name) => fixture.getByRole('button', { name, exact: true });
  const start = Date.parse('2026-07-15T04:05:00.000Z');
  const expires_at = new Date(start + 30_000).toISOString();
  const sha = 'sha256:' + 'a'.repeat(64);
  const draft = {
    candidate: {
      schema: 'doubloon.mainnet-owner-passkey-candidate/v1', profile: 'mainnet:owner-passkey-contact-recovery:20261112',
      network: 'sui_mainnet', chain_identifier: 'fixture', operation_ref: 'fixture',
      transaction_bytes_digest: sha, source_commit: 'a'.repeat(40), source_tree_sha256: sha,
      sender: '0x' + 'a'.repeat(64), signer_public_key_base64: 'A'.repeat(43) + '=',
      gas_budget_mist: '100', nonce: sha, expires_at
    },
    binding_digest: sha, receipt_ref: 'fixture', expected_approval_revision: '1',
    transaction_binding_digest: sha, evidence_manifest_digest: sha
  };
  const inspect = async () => {
    await fixture.getByLabel('Approval package', { exact: true }).fill(JSON.stringify(draft));
    await button('Inspect package').click();
    const digest = await fixture.locator('dd code').first().textContent();
    assert.match(digest, /^sha256:[a-f0-9]{64}$/u);
    await fixture.getByLabel('Type the complete candidate hash').fill(digest);
  };
  const approve = button('Confirm hash and use passkey');
  await page.clock.setFixedTime(start);
  await button('Toggle owner panel').click();
  await button('Publication approval').click();
  await inspect();
  assert.equal(await approve.isEnabled(), true);
  await page.clock.setFixedTime(start + 30_000);
  await fixture.locator('button:disabled').filter({ hasText: 'Confirm hash and use passkey' }).waitFor();

  await page.clock.setFixedTime(start);
  await button('Restore pending approval attempt').click();
  await inspect();
  await button('Refresh approval status').click();
  const reprepare = button('Prepare this same candidate again');
  await reprepare.waitFor();
  await page.clock.setFixedTime(start + 10_000);
  await reprepare.waitFor({ state: 'hidden' });
  assert.equal(await fixture.getByTestId('owner-approval-requests').textContent(), '0');
}
