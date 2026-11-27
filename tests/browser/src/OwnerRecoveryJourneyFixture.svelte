<script lang="ts">
  import { OwnerAccessPanel } from 'zdp-auth-ui/components';
  import { parseOwnerAccessRecoveryStatus, type OwnerAccessClientPort, type OwnerAccessRecoveryStatus,
    type OwnerAccessContactSlot } from 'zdp-auth-ui/owner-access';

  const recoveryId = 'fixture-journey';
  let recovery: OwnerAccessRecoveryStatus = {
    recovery_id: null, state: 'none', notification_policy: 'email-pair-v1',
    proof_slots: [], notifications: [], countdown_at: null, ready_at: null
  };
  const initialRecovery = recovery;
  let calls = $state<unknown[]>([]);
  const unused = async () => { throw new Error('Unexpected owner recovery operation'); };
  function advance(change: Partial<OwnerAccessRecoveryStatus>) {
    const value = parseOwnerAccessRecoveryStatus({ ...recovery, ...change });
    if (!value) throw new Error('Invalid recovery projection in fixture');
    recovery = value;
    return { ok: true as const, value };
  }
  function delivery(slot: OwnerAccessContactSlot, delivery_status: 'unknown' | 'accepted') {
    return {
      ok: true as const, value: {
        recovery_id: recoveryId, slot, challenge_id: `fixture-${slot}`,
        expires_at: new Date(Date.now() + 300_000).toISOString(), delivery_status
      }
    };
  }
  const port: OwnerAccessClientPort = {
    readRecovery: unused, beginApproval: unused, completeApproval: unused, approvalStatus: unused, vetoContact: unused,
    async startRecovery() {
      calls = [...calls, ['start']];
      return advance({ recovery_id: recoveryId, state: 'collecting' });
    },
    async requestContact(input) {
      calls = [...calls, ['request', input]];
      return delivery(input.slot, input.slot === 'email_a' ? 'unknown' : 'accepted');
    },
    async contactDeliveryStatus(input) {
      calls = [...calls, ['delivery-status', input]];
      return delivery(input.slot, 'accepted');
    },
    async confirmContact({ code, ...input }) {
      calls = [...calls, ['confirm', input, code === '000000']];
      const proof_slots = [...recovery.proof_slots, input.slot];
      return advance(proof_slots.length === 2 ? {
        proof_slots, state: 'notifying',
        notifications: [{ slot: 'email_a', status: 'accepted' }, { slot: 'email_b', status: 'pending' }]
      } : { proof_slots });
    },
    async continueRecoveryNotifications(input) {
      calls = [...calls, ['notices', input]];
      return advance({
        state: 'countdown', notifications: [{ slot: 'email_a', status: 'accepted' }, { slot: 'email_b', status: 'accepted' }],
        countdown_at: new Date().toISOString(), ready_at: new Date(Date.now() + 86_400_000).toISOString()
      });
    },
    async beginRecoveryCeremony(input) {
      calls = [...calls, ['begin', input]];
      return {
        ok: true, value: { kind: 'registration', ceremony_id: 'fixture-registration', options: {
          challenge: 'AA', rp: { id: location.hostname, name: 'Fixture' },
          user: { id: 'AA', name: 'fixture', displayName: 'Fixture' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }]
        } }
      };
    },
    async completeRecoveryCeremony(input) {
      calls = [...calls, ['complete', input]];
      return advance({ state: 'completed' });
    }
  };
</script>

<section data-testid="owner-recovery-journey">
  <OwnerAccessPanel {port} {initialRecovery} expectedRpId={location.hostname} />
  <output data-testid="recovery-calls">{JSON.stringify(calls)}</output>
</section>
