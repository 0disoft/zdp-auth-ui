<script lang="ts">
  import OwnerAccess from '../../../src/lib/components/OwnerAccess.svelte';
  import { startPasskeyAuthentication } from '../../../src/lib/passkey';
  import type { OwnerAccessClientPort, OwnerAccessRecoveryStatus } from '../../../src/lib/owner-access';

  let visible = $state(true);
  let delayBegin = $state(false);
  let requests = $state(0);
  let result = $state('idle');
  let releaseBegin: (() => void) | undefined;
  const initialRecovery: OwnerAccessRecoveryStatus = {
    recovery_id: 'fixture-recovery', state: 'collecting', notification_policy: 'email-pair-v1',
    proof_slots: [], notifications: [], countdown_at: null, ready_at: null
  };
  const options = { challenge: 'AA', rpId: location.hostname };
  const unused = async () => { throw new Error('Unexpected fixture operation'); };
  const port: OwnerAccessClientPort = {
    readRecovery: unused, beginApproval: unused, completeApproval: unused, approvalStatus: unused,
    startRecovery: unused, continueRecoveryNotifications: unused, requestContact: unused, contactDeliveryStatus: unused,
    confirmContact: unused, vetoContact: unused, completeRecoveryCeremony: unused,
    async beginRecoveryCeremony() {
      if (delayBegin) await new Promise<void>(resolve => { releaseBegin = resolve; });
      return { ok: true, value: { ceremony_id: 'fixture-ceremony', kind: 'authentication', options } };
    }
  };
  const authenticate: typeof startPasskeyAuthentication = (...args) => {
    requests++;
    return startPasskeyAuthentication(...args);
  };
  let otherSignal: AbortController | undefined;
  async function startOther() {
    otherSignal = new AbortController();
    result = 'pending';
    try { await startPasskeyAuthentication(options, { signal: otherSignal.signal }); }
    catch { result = 'cancelled'; }
  }
</script>

<section data-testid="owner-access-fixture">
  <button type="button" onclick={() => { visible = !visible; }}>Toggle owner panel</button>
  <button type="button" onclick={() => { delayBegin = true; }}>Delay ceremony preparation</button>
  <button type="button" onclick={() => releaseBegin?.()}>Finish ceremony preparation</button>
  <button type="button" onclick={startOther}>Start other passkey prompt</button>
  <button type="button" onclick={() => otherSignal?.abort()}>Cancel other passkey prompt</button>
  <output data-testid="owner-ceremony-requests">{requests}</output>
  <output data-testid="other-prompt-result">{result}</output>
  {#if visible}
    <OwnerAccess {port} {initialRecovery} {authenticate} expectedRpId={location.hostname} />
  {/if}
</section>
