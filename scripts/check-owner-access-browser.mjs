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

async function inspectApproval(fixture, expires_at) {
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
  await fixture.getByLabel('Approval package', { exact: true }).fill(JSON.stringify(draft));
  await fixture.getByRole('button', { name: 'Inspect package', exact: true }).click();
  const digest = await fixture.locator('dd code').first().textContent();
  assert.match(digest, /^sha256:[a-f0-9]{64}$/u);
  await fixture.getByLabel('Type the complete candidate hash').fill(digest);
}

export async function checkOwnerAccessApprovalExpiry(page) {
  const fixture = page.getByTestId('owner-access-fixture');
  const button = (name) => fixture.getByRole('button', { name, exact: true });
  const start = Date.parse('2026-07-15T04:05:00.000Z');
  const expiresAt = new Date(start + 30_000).toISOString();
  const approve = button('Confirm hash and use passkey');
  await page.clock.setFixedTime(start);
  await button('Toggle owner panel').click();
  await button('Publication approval').click();
  await inspectApproval(fixture, expiresAt);
  assert.equal(await approve.isEnabled(), true);
  await page.clock.setFixedTime(start + 30_000);
  await fixture.locator('button:disabled').filter({ hasText: 'Confirm hash and use passkey' }).waitFor();

  await page.clock.setFixedTime(start);
  await button('Restore pending approval attempt').click();
  await inspectApproval(fixture, expiresAt);
  await button('Refresh approval status').click();
  const reprepare = button('Prepare this same candidate again');
  await reprepare.waitFor();
  await page.clock.setFixedTime(start + 10_000);
  await reprepare.waitFor({ state: 'hidden' });
  assert.equal(await fixture.getByTestId('owner-approval-requests').textContent(), '0');
}

export async function checkOwnerAccessMissingApproval(page) {
  await page.evaluate(() => window.mountOwnerAccessFixture());
  const fixture = page.getByTestId('owner-access-fixture').last();
  const button = (name) => fixture.getByRole('button', { name, exact: true });
  const reprepare = button('Prepare this same candidate again');
  const refresh = button('Refresh approval status');
  const count = fixture.getByTestId('owner-approval-requests');
  const expiresAt = new Date('2026-07-15T04:06:00.000Z').toISOString();
  await button('Publication approval').click();
  await inspectApproval(fixture, expiresAt);
  await button('Disconnect approval service').click();
  await button('Confirm hash and use passkey').click();
  await refresh.waitFor();
  await refresh.click();
  await refresh.waitFor();
  assert.equal(await reprepare.count(), 0, 'A lost status response does not open the retry action.');
  assert.equal(await count.textContent(), '1');
  await button('Report missing approval').click();
  await refresh.click();
  await reprepare.waitFor();
  assert.equal(await count.textContent(), '1', 'The lookup must not send another approval preparation.');
  await reprepare.click();
  await fixture.getByTestId('owner-approval-requests').getByText('2', { exact: true }).waitFor();
  const [first, second] = (await fixture.getByTestId('owner-approval-attempt-ids').textContent()).split(',');
  assert.match(first, /^[0-9a-f-]{36}$/u);
  assert.equal(second, first, 'The explicit retry keeps the same candidate ID.');

  // The fixture's persistence port discards writes and returns no saved ID.
  await inspectApproval(fixture, expiresAt);
  await refresh.waitFor();
  assert.equal(await button('Confirm hash and use passkey').isDisabled(), true);
  await refresh.click();
  await reprepare.click();
  await count.getByText('3', { exact: true }).waitFor();
  assert.deepEqual((await fixture.getByTestId('owner-approval-attempt-ids').textContent()).split(','),
    [first, first, first], 'Inspecting the same package after a storage failure keeps the attempted candidate ID.');
}

export async function checkOwnerAccessLostCompletion(page) {
  const start = Date.parse('2026-07-15T04:05:00.000Z');
  await page.clock.setFixedTime(start);
  await page.evaluate(() => {
    const original = navigator.credentials.get;
    window.restoreApprovalFixtureCredentials = () => { navigator.credentials.get = original; };
    navigator.credentials.get = async () => {
      const bytes = new Uint8Array([1]).buffer;
      return { id: 'fixture-assertion', rawId: bytes, type: 'public-key',
        response: { authenticatorData: bytes, clientDataJSON: bytes, signature: bytes },
        getClientExtensionResults: () => ({}) };
    };
    window.mountOwnerAccessFixture();
  });
  try {
    const fixture = page.getByTestId('owner-access-fixture').last();
    const button = name => fixture.getByRole('button', { name, exact: true });
    const read = async id => JSON.parse(await fixture.getByTestId(id).textContent());
    const completed = fixture.getByText('Candidate approval completed.', { exact: true });
    await button('Lose approval completion response').click();
    await button('Publication approval').click();
    await inspectApproval(fixture, new Date(start + 60_000).toISOString());
    const digest = await fixture.locator('dd code').first().textContent();
    await button('Confirm hash and use passkey').click();
    await fixture.getByRole('alert').getByText(/The outcome is unknown/).waitFor();
    assert.equal(await completed.count(), 0);
    assert.deepEqual(await read('owner-approval-status-ids'), []);
    assert.deepEqual(await read('owner-approval-forgotten-digests'), []);
    const handoff = await read('owner-approval-completion-calls');
    const id = handoff[0]?.candidate_id;
    assert.match(id, /^[0-9a-f-]{36}$/u);
    assert.deepEqual(handoff, [{ candidate_id: id, ceremony_id: 'fixture-approval-ceremony', credential: {
      id: 'fixture-assertion', rawId: 'AQ', type: 'public-key',
      response: { authenticatorData: 'AQ', clientDataJSON: 'AQ', signature: 'AQ' }, clientExtensionResults: {}
    } }]);
    await button('Refresh approval status').click();
    await completed.waitFor();
    await fixture.getByText('fixture-approval-reference', { exact: true }).waitFor();
    assert.deepEqual(await read('owner-approval-status-ids'), [id]);
    assert.deepEqual(await read('owner-approval-completion-calls'), handoff);
    assert.deepEqual(await read('owner-approval-forgotten-digests'), [digest]);
    assert.equal(await fixture.getByTestId('owner-approval-requests').textContent(), '1');
    assert.equal(await button('Prepare this same candidate again').count(), 0);
  } finally {
    await page.evaluate(() => window.restoreApprovalFixtureCredentials());
  }
}

export async function checkOwnerRecoveryJourney(page) {
  const start = Date.parse('2026-07-15T04:05:00.000Z');
  const readyAt = start + 86_400_000;
  await page.clock.setFixedTime(start);
  await page.evaluate(() => window.mountOwnerRecoveryJourneyFixture());
  const fixture = page.getByTestId('owner-recovery-journey');
  const button = name => fixture.getByRole('button', { name, exact: true });
  const heading = name => fixture.getByRole('heading', { name, exact: true });
  const calls = async () => JSON.parse(await fixture.getByTestId('recovery-calls').textContent());
  const contact = name => fixture.locator('.contact').filter({ has: page.getByText(name, { exact: true }) });
  const email = contact('Recovery email 1'), phone = contact('Recovery phone 2');
  const confirm = async target => {
    await target.getByLabel('Verification code').fill('000000');
    await target.getByRole('button', { name: 'Verify contact', exact: true }).click();
  };
  await button('Start recovery').click();
  await heading('Verify contacts · 0/2').waitFor();
  await email.getByRole('button', { name: 'Send verification code', exact: true }).click();
  const recheck = email.getByRole('button', { name: 'Recheck original send', exact: true });
  await recheck.waitFor();
  assert.equal(await email.getByRole('textbox', { name: 'Verification code' }).count(), 0);
  await recheck.click();
  await confirm(email);
  await heading('Verify contacts · 1/2').waitFor();
  await email.getByText('Verified', { exact: true }).waitFor();
  await phone.getByRole('button', { name: 'Send verification code', exact: true }).click();
  await confirm(phone);
  await heading('Security notices').waitFor();
  assert.equal(await fixture.locator('.notice-list li').count(), 2);
  assert.equal(await button('Use passkey to bind').count(), 0);
  await button('Send undispatched notifications').click();
  await heading('24-hour wait').waitFor();
  assert.equal(await fixture.locator('time').getAttribute('datetime'), new Date(readyAt).toISOString());
  assert.equal(await button('Use passkey to bind').count(), 0);
  await page.clock.setFixedTime(readyAt);
  const bind = button('Use passkey to bind');
  await bind.waitFor();
  assert.equal(await bind.isDisabled(), true);

  await page.evaluate(() => {
    const original = navigator.credentials.create;
    window.restoreRecoveryFixtureCredentials = () => { navigator.credentials.create = original; };
    navigator.credentials.create = async () => {
      const bytes = new Uint8Array([1]).buffer;
      return { id: 'fixture-key', rawId: bytes, type: 'public-key',
        response: { attestationObject: bytes, clientDataJSON: bytes }, getClientExtensionResults: () => ({}) };
    };
  });
  try {
    await fixture.getByLabel('New passkey label').fill('  Recovery key  ');
    await bind.click();
    await fixture.getByText('Completed', { exact: true }).waitFor();
  } finally {
    await page.evaluate(() => window.restoreRecoveryFixtureCredentials());
  }

  const recovery_id = 'fixture-journey';
  const firstSlot = { recovery_id, slot: 'email_a' }, secondSlot = { recovery_id, slot: 'phone_b' };
  const firstChallenge = { ...firstSlot, challenge_id: 'fixture-email_a' };
  assert.deepEqual(await calls(), [
    ['start'], ['request', firstSlot], ['delivery-status', firstChallenge], ['confirm', firstChallenge, true],
    ['request', secondSlot], ['confirm', { ...secondSlot, challenge_id: 'fixture-phone_b' }, true],
    ['notices', { recovery_id }], ['begin', { operation: 'rebind', recovery_id }],
    ['complete', { operation: 'rebind', recovery_id, ceremony_id: 'fixture-registration', label: 'Recovery key',
      credential: { id: 'fixture-key', rawId: 'AQ', type: 'public-key',
        response: { attestationObject: 'AQ', clientDataJSON: 'AQ' }, clientExtensionResults: {} } }]
  ]);
}
