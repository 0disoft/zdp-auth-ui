<script lang="ts">
  import { Button, Surface } from 'zdp-design-system';
  import { onDestroy, untrack } from 'svelte';
  import { startPasskeyAuthentication, startPasskeyRegistration, cancelPasskeyCeremony,
    ZdpPasskeyCeremonyError } from '../passkey';
  import {
    ownerAccessCandidateDigest, ownerAccessApprovalMatches, parseOwnerAccessApprovalDraft,
    parseOwnerAccessApprovalInput, type OwnerAccessApprovalComplete, type OwnerAccessApprovalDraft,
    type OwnerAccessApprovalStatus,
    type OwnerAccessClientPort, type OwnerAccessContactDelivery, type OwnerAccessContactSlot,
    type OwnerAccessApprovalAttemptPort, type OwnerAccessFeedback, type OwnerAccessRecoveryCeremony,
    type OwnerAccessRecoveryStatus
  } from '../owner-access';
  import { getOwnerAccessMessages } from '../owner-access-messages';
  interface Props {
    port: OwnerAccessClientPort; expectedRpId: string; locale?: string;
    initialRecovery?: OwnerAccessRecoveryStatus | null; localPreview?: boolean;
    authenticate?: typeof startPasskeyAuthentication; register?: typeof startPasskeyRegistration;
    approvalAttempts?: OwnerAccessApprovalAttemptPort;
  }
  let { port, expectedRpId, locale = 'en', initialRecovery = null, localPreview = false,
    authenticate = startPasskeyAuthentication, register = startPasskeyRegistration,
    approvalAttempts }: Props = $props();
  const m = $derived(getOwnerAccessMessages(locale));
  const slots = ['email_a','email_b','phone_a','phone_b'] as const;
  let recovery = $state<OwnerAccessRecoveryStatus | null>(untrack(() => initialRecovery));
  let delivery = $state<Partial<Record<OwnerAccessContactSlot,OwnerAccessContactDelivery>>>({});
  let pendingDeliveries = $state<OwnerAccessContactSlot[]>([]);
  let busy = $state(false), feedback = $state<OwnerAccessFeedback>(null), retryAfter = $state<number|null>(null);
  let approvalDraft = $state<OwnerAccessApprovalDraft|null>(null), approvalDigest = $state(''), confirmation = $state('');
  let approvalComplete = $state<OwnerAccessApprovalComplete|null>(null), packageError = $state(false);
  let approvalAttemptId = $state<string|null>(null), approvalStatus = $state<OwnerAccessApprovalStatus|null>(null);
  let rebindLabel = $state('');
  let approvalReady = $derived(!!approvalDraft && !!approvalDigest && confirmation.trim() === approvalDigest);
  let approvalCanReprepare = $derived(!!approvalAttemptId && approvalStatus?.state === 'pending' &&
    Date.parse(approvalStatus.expires_at) > Date.now());
  let rebindAvailable = $derived(!!recovery?.ready_at && Date.parse(recovery.ready_at) <= Date.now());
  let hasPendingNotifications = $derived(!!recovery?.notifications.some(item => item.status === 'pending'));

  onDestroy(cancelPasskeyCeremony);

  async function rememberAttempt(digest:string,candidateId:string) {
    try { await approvalAttempts?.remember(digest,candidateId); } catch {}
  }
  async function recallAttempt(digest:string) {
    try { const value = await approvalAttempts?.read(digest);
      return value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(value) ? value : null;
    } catch { return null; }
  }
  async function forgetAttempt(digest:string) {
    try { await approvalAttempts?.forget(digest); } catch {}
  }

  async function inspectPackage(event:SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form);
    const source = String(values.get('approval_package') ?? ''); form.reset(); values.forEach((_v,key)=>values.delete(key));
    packageError = false; approvalDraft = null; approvalDigest = ''; confirmation = ''; approvalComplete = null;
    approvalAttemptId = null; approvalStatus = null;
    try {
      const draft = parseOwnerAccessApprovalDraft(JSON.parse(source));
      if (!draft || Date.parse(draft.candidate.expires_at) <= Date.now()) { packageError = true; return; }
      approvalDraft = draft; approvalDigest = await ownerAccessCandidateDigest(draft.candidate);
      approvalAttemptId = await recallAttempt(approvalDigest);
    } catch { packageError = true; }
  }

  async function runApproval(input:NonNullable<ReturnType<typeof parseOwnerAccessApprovalInput>>,candidateId:string) {
    approvalAttemptId = candidateId; await rememberAttempt(input.candidate_digest_confirmation,candidateId);
    busy = true; feedback = null; retryAfter = null; approvalStatus = null;
    try {
      const begin = await port.beginApproval(input,candidateId);
      if (!begin.ok) { feedback = begin.feedback; retryAfter = begin.retryAfter; return; }
      approvalAttemptId = begin.value.candidate_id; await rememberAttempt(input.candidate_digest_confirmation,begin.value.candidate_id);
      let credential;
      try { credential = await authenticate(begin.value.options,{timeoutMs:60000}); }
      catch (error) {
        feedback = error instanceof ZdpPasskeyCeremonyError && ['cancelled','not-allowed'].includes(error.reason) ? null : 'failed';
        return;
      }
      const complete = await port.completeApproval({candidate_id:begin.value.candidate_id,
        ceremony_id:begin.value.ceremony_id,credential});
      credential = undefined;
      if (!complete.ok) { feedback = complete.feedback; retryAfter = complete.retryAfter; return; }
      await forgetAttempt(input.candidate_digest_confirmation);
      approvalComplete = complete.value; approvalDraft = null; approvalDigest = ''; confirmation = ''; feedback = 'saved';
    } finally { busy = false; }
  }

  async function submitApproval() {
    if (!approvalDraft || !approvalReady || busy || approvalAttemptId) return;
    const input = parseOwnerAccessApprovalInput({...approvalDraft,candidate_digest_confirmation:confirmation.trim()});
    if (!input || !await ownerAccessApprovalMatches(input)) { feedback = 'failed'; return; }
    await runApproval(input,crypto.randomUUID());
  }
  async function reprepareApproval() {
    if (!approvalDraft || !approvalCanReprepare || !approvalAttemptId || busy) return;
    const input = parseOwnerAccessApprovalInput({...approvalDraft,candidate_digest_confirmation:confirmation.trim()});
    if (!input || !await ownerAccessApprovalMatches(input)) { feedback = 'failed'; return; }
    await runApproval(input,approvalAttemptId);
  }
  async function refreshApproval() {
    if (!approvalAttemptId || busy) return;
    busy = true; feedback = null;
    try {
      const result = await port.approvalStatus({candidate_id:approvalAttemptId});
      if (!result.ok) { feedback = result.feedback; retryAfter = result.retryAfter; return; }
      approvalStatus = result.value; retryAfter = null;
      if ((result.value.state === 'approved' || result.value.state === 'consumed') && result.value.approval_ref) {
        await forgetAttempt(approvalDigest);
        approvalComplete = {candidate_id:result.value.candidate_id,approval_ref:result.value.approval_ref,
          candidate_digest:result.value.candidate_digest,expires_at:result.value.expires_at};
        approvalDraft = null; approvalDigest = ''; confirmation = ''; feedback = 'saved';
      } else feedback = result.value.state === 'expired' ? 'expired' : result.value.state === 'cancelled' ? 'failed' : 'unconfirmed';
    } finally { busy = false; }
  }

  function acceptRecovery(result:Awaited<ReturnType<OwnerAccessClientPort['readRecovery']>>) {
    if (!result.ok) { feedback = result.feedback; retryAfter = result.retryAfter; return false; }
    recovery = result.value; feedback = 'saved'; retryAfter = null; return true;
  }
  async function refresh() {
    if (busy) return; busy = true;
    try { acceptRecovery(await port.readRecovery()); } finally { busy = false; }
  }
  async function startRecovery() {
    if (busy || !recovery) return; busy = true; feedback = null;
    try { if (acceptRecovery(await port.startRecovery())) delivery = {}; } finally { busy = false; }
  }
  async function continueNotifications() {
    if (busy || !recovery?.recovery_id || !hasPendingNotifications) return;
    busy = true; feedback = null;
    try { acceptRecovery(await port.continueRecoveryNotifications({recovery_id:recovery.recovery_id})); }
    finally { busy = false; }
  }
  async function requestContact(slot:OwnerAccessContactSlot) {
    if (busy || !recovery?.recovery_id) return; busy = true; feedback = null;
    try {
      const result = await port.requestContact({recovery_id:recovery.recovery_id,slot});
      if (!result.ok) {
        if (result.feedback === 'unconfirmed' && !pendingDeliveries.includes(slot)) pendingDeliveries = [...pendingDeliveries,slot];
        feedback = result.feedback; retryAfter = result.retryAfter; return;
      }
      pendingDeliveries = pendingDeliveries.filter(item => item !== slot);
      delivery = {...delivery,[slot]:result.value};
      feedback = result.value.delivery_status === 'unknown' ? 'unconfirmed' : 'saved';
    } finally { busy = false; }
  }
  async function deliveryStatus(slot:OwnerAccessContactSlot) {
    const challenge = delivery[slot]; if (busy || !recovery?.recovery_id || !challenge) return;
    busy = true; feedback = null;
    try {
      const result = await port.contactDeliveryStatus({recovery_id:recovery.recovery_id,slot,challenge_id:challenge.challenge_id});
      if (!result.ok) { feedback = result.feedback; retryAfter = result.retryAfter; return; }
      delivery = {...delivery,[slot]:result.value}; feedback = result.value.delivery_status === 'unknown' ? 'unconfirmed' : 'saved';
    } finally { busy = false; }
  }
  async function confirmContact(event:SubmitEvent, slot:OwnerAccessContactSlot) {
    event.preventDefault(); if (busy || !recovery?.recovery_id) return;
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form);
    let code = String(values.get('code') ?? ''); form.reset(); values.forEach((_v,key)=>values.delete(key));
    const challenge = delivery[slot]; if (!challenge) { code = ''; return; }
    busy = true; feedback = null;
    try {
      const result = await port.confirmContact({recovery_id:recovery.recovery_id,slot,
        challenge_id:challenge.challenge_id,code});
      code = ''; if (!result.ok) { feedback = result.feedback; retryAfter = result.retryAfter; return; }
      recovery = result.value; delete delivery[slot]; delivery = {...delivery};
      pendingDeliveries = pendingDeliveries.filter(item => item !== slot); feedback = 'saved';
    } finally { busy = false; }
  }
  async function vetoContact(event:SubmitEvent) {
    event.preventDefault(); if (busy || !recovery?.recovery_id) return;
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form);
    const slot = String(values.get('slot') ?? '') as OwnerAccessContactSlot;
    let token = String(values.get('veto_token') ?? ''); form.reset(); values.forEach((_v,key)=>values.delete(key));
    if (!slots.includes(slot) || !token) { token = ''; return; }
    busy = true; feedback = null;
    try {
      const result = await port.vetoContact({recovery_id:recovery.recovery_id,slot,veto_token:token});
      token = ''; if (!result.ok) { feedback = result.feedback; retryAfter = result.retryAfter; return; }
      recovery = result.value; feedback = 'saved';
    } finally { busy = false; }
  }
  async function runCeremony(operation:OwnerAccessRecoveryCeremony) {
    if (busy || !recovery?.recovery_id) return;
    const label = operation === 'rebind' ? rebindLabel.trim() : undefined;
    if (operation === 'rebind' && (!label || Array.from(label).length > 80)) return;
    busy = true; feedback = null;
    try {
      const begin = await port.beginRecoveryCeremony({operation,recovery_id:recovery.recovery_id});
      if (!begin.ok) { feedback = begin.feedback; retryAfter = begin.retryAfter; return; }
      let credential;
      try { credential = begin.value.kind === 'registration'
        ? await register(begin.value.options,{timeoutMs:60000})
        : await authenticate(begin.value.options,{timeoutMs:60000}); }
      catch (error) {
        feedback = error instanceof ZdpPasskeyCeremonyError && ['cancelled','not-allowed'].includes(error.reason) ? null : 'failed';
        return;
      }
      const complete = await port.completeRecoveryCeremony({operation,recovery_id:recovery.recovery_id,
        ceremony_id:begin.value.ceremony_id,credential,...(label ? {label} : {})});
      credential = undefined;
      if (!complete.ok) { feedback = complete.feedback; retryAfter = complete.retryAfter; return; }
      recovery = complete.value; rebindLabel = ''; feedback = 'saved';
    } finally { busy = false; }
  }
</script>

<section class="owner-access" aria-labelledby="owner-access-title" aria-busy={busy}>
  <h2 id="owner-access-title">{m.title}</h2>
  <p>{m.intro}</p>
  {#if localPreview}<p role="status">{m.preview}</p>{/if}
  {#if feedback}<p role={feedback === 'saved' ? 'status' : 'alert'}>{m[feedback === 'unavailable' ? 'unavailableMessage' : feedback]} {#if retryAfter !== null}{m.retryAfter} {retryAfter}{/if}</p>{/if}

  <Surface>
    <h3>{m.approval}</h3><p>{m.approvalIntro}</p>
    {#if approvalComplete}
      <p role="status">{m.approvalDone}</p>
      <dl><dt>{m.approvalRef}</dt><dd><code>{approvalComplete.approval_ref}</code></dd><dt>{m.digest}</dt><dd><code>{approvalComplete.candidate_digest}</code></dd><dt>{m.expires}</dt><dd>{approvalComplete.expires_at}</dd></dl>
    {:else}
      <form method="post" action="" autocomplete="off" onsubmit={inspectPackage}>
        <fieldset disabled={busy}><label>{m.package}<textarea name="approval_package" required rows="7" spellcheck="false"></textarea></label><Button type="submit">{m.inspect}</Button></fieldset>
      </form>
      {#if packageError}<p role="alert">{m.failed}</p>{/if}
      {#if approvalDraft}
        <dl><dt>{m.digest}</dt><dd><code>{approvalDigest}</code></dd><dt>{m.expires}</dt><dd>{approvalDraft.candidate.expires_at}</dd></dl>
        {#if approvalAttemptId && !approvalComplete}<div class="approval-recovery"><p>{m.approvalPendingHelp}</p>
          {#if approvalStatus}<p role="status">{m.approvalStates[approvalStatus.state]}{#if approvalStatus.approval_ref} · <code>{approvalStatus.approval_ref}</code>{/if}</p>{/if}
          <Button type="button" disabled={busy} onclick={() => void refreshApproval()}>{busy ? m.wait : m.refreshApproval}</Button>
          {#if approvalCanReprepare}<Button type="button" disabled={busy} onclick={() => void reprepareApproval()}>{m.reprepareApproval}</Button>{/if}
        </div>{/if}
        <label>{m.confirmDigest}<input bind:value={confirmation} type="text" autocomplete="off" spellcheck="false" pattern="sha256:[a-f0-9]{64}" maxlength="71" /></label>
        <Button type="button" disabled={busy || !approvalReady || !!approvalAttemptId} onclick={() => void submitApproval()}>{busy ? m.wait : m.approve}</Button>
      {/if}
    {/if}
  </Surface>

  <Surface>
    <h3>{m.recovery}</h3><p>{m.recoveryIntro}</p>
    <div class="actions"><Button type="button" disabled={busy} onclick={() => void refresh()}>{busy ? m.wait : m.refresh}</Button>
      {#if !recovery || recovery.state === 'none' || recovery.state === 'cancelled' || recovery.state === 'completed'}
        <Button type="button" disabled={busy || !recovery} onclick={() => void startRecovery()}>{m.start}</Button>
      {/if}
    </div>
    {#if !recovery}
      <p role="status">{m.unavailableMessage}</p>
    {:else if recovery.state === 'none'}
      <p role="status">{m.notStarted}</p>
    {:else}
      <dl><dt>{m.state}</dt><dd>{m.states[recovery.state]}</dd><dt>{m.proofSlots}</dt><dd>{recovery.proof_slots.length ? recovery.proof_slots.map(slot => m[slot]).join(', ') : '—'}</dd>
        <dt>{m.notifications}</dt><dd>{recovery.notifications.length ? recovery.notifications.map(item => `${m[item.slot]} ${m[item.status]}`).join(', ') : '—'}</dd>
        <dt>{m.countdown}</dt><dd>{recovery.countdown_at ?? m.duration24h}</dd><dt>{m.ready}</dt><dd>{recovery.ready_at ?? '—'}</dd></dl>
      <div class="contacts">
        {#each slots as slot}
          {@const proof = recovery.proof_slots.includes(slot)}<div class="contact"><strong>{m[slot]}</strong>
            {#if proof}<span>{m.accepted}</span>{:else if recovery.recovery_id}
              <Button type="button" disabled={busy || delivery[slot]?.delivery_status === 'unknown'} onclick={() => void requestContact(slot)}>{pendingDeliveries.includes(slot) ? m.recheckSend : m.sendCode}</Button>
              {#if delivery[slot]}<span>{m[delivery[slot].delivery_status!]}</span>{/if}
              {#if delivery[slot]?.delivery_status === 'unknown'}<p role="alert">{m.noAutoResend}</p><Button type="button" disabled={busy} onclick={() => void deliveryStatus(slot)}>{m.refresh}</Button>{/if}
              {#if delivery[slot] && delivery[slot]?.delivery_status !== 'unknown' && delivery[slot]?.delivery_status !== 'rejected'}
                <form method="post" action="" autocomplete="off" onsubmit={event => void confirmContact(event,slot)}><fieldset disabled={busy}><label>{m.code}<input name="code" type="text" inputmode="numeric" required pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="off" /></label><Button type="submit">{m.confirmCode}</Button></fieldset></form>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
      {#if recovery.recovery_id && hasPendingNotifications}
        <div class="notification-resume"><p>{m.continueNotificationsHelp}</p>
          <Button type="button" disabled={busy} onclick={() => void continueNotifications()}>{busy ? m.wait : m.continueNotifications}</Button>
        </div>
      {/if}
      {#if recovery.recovery_id}
        <div class="recovery-actions">
          <Button type="button" disabled={busy} onclick={() => void runCeremony('veto')}>{m.passkeyVeto}</Button>
          {#if rebindAvailable}<label>{m.label}<input bind:value={rebindLabel} type="text" maxlength="80" autocomplete="off" /></label><Button type="button" disabled={busy || !rebindLabel.trim()} onclick={() => void runCeremony('rebind')}>{m.bind}</Button>{/if}
        </div>
        <details><summary>{m.veto}</summary><p>{m.vetoHelp}</p>
          <form method="post" action="" autocomplete="off" onsubmit={vetoContact}><fieldset disabled={busy}>
            <label>{m.slot}<select name="slot" required>{#each slots as slot}<option value={slot}>{m[slot]}</option>{/each}</select></label>
            <label>{m.vetoToken}<input name="veto_token" type="password" required autocomplete="off" /></label><Button type="submit">{m.vetoContact}</Button>
          </fieldset></form>
        </details>
      {/if}
    {/if}
    <p>{m.noWalletReset}</p>
  </Surface>
</section>

<style>
  .owner-access { display:grid; gap:var(--zdp-space-4); max-width:100%; }
  fieldset { border:0; padding:0; display:grid; gap:var(--zdp-space-3); min-width:0; }
  label { display:grid; gap:var(--zdp-space-2); }
  input,select,textarea { font:inherit; padding:var(--zdp-space-3); max-width:100%; color:inherit; background:var(--zdp-color-surface); border:var(--zdp-border-width,thin) solid var(--zdp-color-border); border-radius:var(--zdp-radius-sm); }
  textarea { min-block-size:calc(var(--zdp-space-10) * 2); resize:vertical; }
  dl { display:grid; grid-template-columns:minmax(8rem,auto) minmax(0,1fr); gap:var(--zdp-space-2) var(--zdp-space-3); overflow-wrap:anywhere; }
  .actions,.recovery-actions,.notification-resume,.approval-recovery { display:flex; flex-wrap:wrap; align-items:end; gap:var(--zdp-space-3); }
  .contacts { display:grid; gap:var(--zdp-space-3); }
  .contact { display:grid; gap:var(--zdp-space-2); padding-block:var(--zdp-space-3); border-block-end:var(--zdp-border-width,thin) solid var(--zdp-color-border); }
  code { overflow-wrap:anywhere; }
</style>
