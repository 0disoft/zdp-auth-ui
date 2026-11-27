<script lang="ts">
  import OwnerAccess from '../../../src/lib/components/OwnerAccess.svelte';
  import { startPasskeyAuthentication } from '../../../src/lib/passkey';
  import type { OwnerAccessApprovalComplete, OwnerAccessClientPort, OwnerAccessRecoveryStatus } from '../../../src/lib/owner-access';

  let visible = $state(true);
  let delayBegin = $state(false);
  let requests = $state(0);
  let result = $state('idle');
  let restoreAttempt = $state(false);
  let approvalRequests = $state(0);
  let approvalAttemptIds = $state<string[]>([]);
  let approvalStatusFailure = $state<'unconfirmed' | 'failed' | null>(null);
  let loseCompletion = $state(false);
  let preparedApproval: OwnerAccessApprovalComplete | undefined;
  let committed = false;
  let completionCalls = $state<Parameters<OwnerAccessClientPort['completeApproval']>[0][]>([]);
  let statusIds = $state<string[]>([]);
  let forgottenDigests = $state<string[]>([]);
  const candidateId = '00000000-0000-4000-8000-000000000001';
  const approvalAttempts = {
    read: () => restoreAttempt ? candidateId : null,
    remember: () => {},
    forget: (digest: string) => { forgottenDigests = [...forgottenDigests, digest]; }
  };
  let releaseBegin: (() => void) | undefined;
  const initialRecovery: OwnerAccessRecoveryStatus = {
    recovery_id: 'fixture-recovery', state: 'collecting', notification_policy: 'email-pair-v1',
    proof_slots: [], notifications: [], countdown_at: null, ready_at: null
  };
  const options = { challenge: 'AA', rpId: location.hostname };
  const unused = async () => { throw new Error('Unexpected fixture operation'); };
  const port: OwnerAccessClientPort = {
    readRecovery: unused,
    async beginApproval(input, id) {
      approvalRequests++;
      if (loseCompletion && id) {
        preparedApproval = {
          candidate_id: id, candidate_digest: input.candidate_digest_confirmation,
          expires_at: input.candidate.expires_at, approval_ref: 'fixture-approval-reference'
        };
        return { ok: true, value: { candidate_id: id, ceremony_id: 'fixture-approval-ceremony', options } };
      }
      if (approvalStatusFailure) {
        approvalAttemptIds = [...approvalAttemptIds, id ?? 'missing'];
        return { ok: false, feedback: 'unconfirmed', retryAfter: null };
      }
      return { ok: false, feedback: 'expired', retryAfter: null };
    },
    async completeApproval(input) {
      completionCalls = [...completionCalls, input];
      committed = true;
      return { ok: false, feedback: 'unconfirmed', retryAfter: null };
    },
    async approvalStatus({ candidate_id }) {
      statusIds = [...statusIds, candidate_id];
      if (loseCompletion && preparedApproval && committed && preparedApproval.candidate_id === candidate_id) {
        return { ok: true, value: { ...preparedApproval, state: 'approved' } };
      }
      if (approvalStatusFailure) return { ok: false, feedback: approvalStatusFailure, retryAfter: null };
      return { ok: true, value: {
        candidate_id: candidateId, candidate_digest: 'sha256:' + 'a'.repeat(64),
        expires_at: new Date(Date.now() + 10_000).toISOString(), state: 'pending', approval_ref: null
      } };
    },
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
  <button type="button" onclick={() => { restoreAttempt = true; }}>Restore pending approval attempt</button>
  <button type="button" onclick={() => { approvalStatusFailure = 'unconfirmed'; }}>Disconnect approval service</button>
  <button type="button" onclick={() => { approvalStatusFailure = 'failed'; }}>Report missing approval</button>
  <button type="button" onclick={() => { loseCompletion = true; }}>Lose approval completion response</button>
  <output data-testid="owner-ceremony-requests">{requests}</output>
  <output data-testid="owner-approval-requests">{approvalRequests}</output>
  <output data-testid="owner-approval-attempt-ids">{approvalAttemptIds.join(',')}</output>
  <output data-testid="owner-approval-completion-calls">{JSON.stringify(completionCalls)}</output>
  <output data-testid="owner-approval-status-ids">{JSON.stringify(statusIds)}</output>
  <output data-testid="owner-approval-forgotten-digests">{JSON.stringify(forgottenDigests)}</output>
  <output data-testid="other-prompt-result">{result}</output>
  {#if visible}
    <OwnerAccess {port} {initialRecovery} {authenticate} {approvalAttempts} expectedRpId={location.hostname} />
  {/if}
</section>
