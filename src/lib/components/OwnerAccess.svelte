<script lang="ts">
  import { Button, Surface } from 'zdp-design-system';
  import { onDestroy, onMount, untrack, type Snippet } from 'svelte';
  import { startPasskeyAuthentication, startPasskeyRegistration,
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
    enrollment?: Snippet; enrollmentBusy?: boolean;
  }
  let { port, expectedRpId, locale = 'en', initialRecovery = null, localPreview = false,
    authenticate = startPasskeyAuthentication, register = startPasskeyRegistration,
    approvalAttempts, enrollment, enrollmentBusy = false }: Props = $props();
  const titleId = $props.id();
  const panelTitle = titleId + '-panel';
  const m = $derived(getOwnerAccessMessages(locale));
  const ceremonyLifetime = new AbortController();
  const slots = ['email_a','email_b','phone_a','phone_b'] as const;
  let recovery = $state<OwnerAccessRecoveryStatus | null>(untrack(() => initialRecovery));
  let delivery = $state<Partial<Record<OwnerAccessContactSlot,OwnerAccessContactDelivery>>>({});
  let pendingDeliveries = $state<OwnerAccessContactSlot[]>([]);
  type Section = 'enrollment' | 'approval' | 'recovery';
  type Action = 'approval' | 'refresh' | 'start' | 'notices' | 'veto' | 'receipt' | 'rebind' | OwnerAccessContactSlot;
  let section = $state<Section>(untrack(() =>
    enrollment && !isActive(initialRecovery) ? 'enrollment' : 'recovery'));
  let action = $state<Action>('refresh');
  let busy = $state(false), feedback = $state<OwnerAccessFeedback | 'dismissed' | 'checking_passkey'>(null);
  let retryAfter = $state<number|null>(null);
  let now = $state(0);
  let mounted = $state(false);
  let approvalDraft = $state<OwnerAccessApprovalDraft|null>(null), approvalDigest = $state(''), confirmation = $state('');
  let approvalComplete = $state<OwnerAccessApprovalComplete|null>(null), packageError = $state(false);
  let approvalAttemptId = $state<string|null>(null), approvalStatus = $state<OwnerAccessApprovalStatus|null>(null);
  let rebindLabel = $state('');
  let approvalReady = $derived(!!approvalDraft && !!approvalDigest && confirmation.trim() === approvalDigest);
  let approvalCanReprepare = $derived(!!approvalAttemptId && approvalStatus?.state === 'pending' &&
    Date.parse(approvalStatus.expires_at) > Date.now());
  let activeRecovery = $derived(isActive(recovery));
  let rebindAvailable = $derived(recovery?.state === 'countdown' && !!recovery.ready_at && Date.parse(recovery.ready_at) <= now);
  let activeStep = $derived(recovery?.state === 'notifying' ? 1
    : recovery?.state === 'countdown' ? (rebindAvailable ? 3 : 2)
    : 0);
  let noticeSlots = $derived(recovery?.notification_policy === 'all-contacts-v1' ? slots : slots.slice(0, 2));
  let hasPendingNotifications = $derived(!!recovery?.notifications.some(item => item.status === 'pending'));

  onMount(() => {
    mounted = true;
    now = Date.now();
    const timer = setInterval(() => { now = Date.now(); }, 1000);
    return () => clearInterval(timer);
  });
  onDestroy(() => ceremonyLifetime.abort());

  function isActive(status: OwnerAccessRecoveryStatus | null) {
    return status?.state === 'collecting' || status?.state === 'notifying' || status?.state === 'countdown';
  }

  function openSection(next: Section) {
    if (section === next || busy || enrollmentBusy) return;
    section = next;
    feedback = null;
    retryAfter = null;
  }

  function startAction(next: Action) {
    action = next;
    busy = true;
    feedback = null;
    retryAfter = null;
  }

  function passkeyFailure(error: unknown) {
    return error instanceof ZdpPasskeyCeremonyError && ['cancelled', 'not-allowed'].includes(error.reason)
      ? 'dismissed' : 'failed';
  }

  function displayTime(time: string) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium', timeStyle: 'short', timeZone: locale === 'ko' ? 'Asia/Seoul' : 'UTC'
    }).format(new Date(time)) + (locale === 'ko' ? ' KST' : ' UTC');
  }

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
    if (busy) return;
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form);
    const source = String(values.get('approval_package') ?? ''); form.reset(); values.forEach((_v,key)=>values.delete(key));
    startAction('approval');
    packageError = false; approvalDraft = null; approvalDigest = ''; confirmation = ''; approvalComplete = null;
    approvalAttemptId = null; approvalStatus = null;
    try {
      const draft = parseOwnerAccessApprovalDraft(JSON.parse(source));
      if (!draft || Date.parse(draft.candidate.expires_at) <= Date.now()) { packageError = true; return; }
      approvalDraft = draft; approvalDigest = await ownerAccessCandidateDigest(draft.candidate);
      approvalAttemptId = await recallAttempt(approvalDigest);
    } catch { packageError = true; } finally { busy = false; }
  }

  async function runApproval(input:NonNullable<ReturnType<typeof parseOwnerAccessApprovalInput>>,candidateId:string) {
    const signal = ceremonyLifetime.signal;
    if (signal.aborted) return;
    approvalAttemptId = candidateId; approvalStatus = null;
    await rememberAttempt(input.candidate_digest_confirmation,candidateId);
    if (signal.aborted) return;
    const begin = await port.beginApproval(input,candidateId);
    if (!begin.ok) { feedback = begin.feedback; retryAfter = begin.retryAfter; return; }
    approvalAttemptId = begin.value.candidate_id; await rememberAttempt(input.candidate_digest_confirmation,begin.value.candidate_id);
    if (signal.aborted) return;
    let credential;
    feedback = 'checking_passkey';
    try { credential = await authenticate(begin.value.options,{timeoutMs:60000,signal}); }
    catch (error) {
      feedback = passkeyFailure(error);
      return;
    }
    if (signal.aborted) return;
    feedback = null;
    const complete = await port.completeApproval({candidate_id:begin.value.candidate_id,
      ceremony_id:begin.value.ceremony_id,credential});
    credential = undefined;
    if (!complete.ok) { feedback = complete.feedback; retryAfter = complete.retryAfter; return; }
    await forgetAttempt(input.candidate_digest_confirmation);
    approvalComplete = complete.value; approvalDraft = null; approvalDigest = ''; confirmation = ''; feedback = 'saved';
  }

  async function submitApproval() {
    if (!approvalDraft || !approvalReady || busy || approvalAttemptId) return;
    const input = parseOwnerAccessApprovalInput({...approvalDraft,candidate_digest_confirmation:confirmation.trim()});
    startAction('approval');
    try {
      if (!input || !await ownerAccessApprovalMatches(input)) { feedback = 'failed'; return; }
      await runApproval(input, crypto.randomUUID());
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function reprepareApproval() {
    if (!approvalDraft || !approvalCanReprepare || !approvalAttemptId || busy) return;
    const input = parseOwnerAccessApprovalInput({...approvalDraft,candidate_digest_confirmation:confirmation.trim()});
    startAction('approval');
    try {
      if (!input || !await ownerAccessApprovalMatches(input)) { feedback = 'failed'; return; }
      await runApproval(input, approvalAttemptId);
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function refreshApproval() {
    if (!approvalAttemptId || busy) return;
    startAction('approval');
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
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }

  function acceptRecovery(result:Awaited<ReturnType<OwnerAccessClientPort['readRecovery']>>) {
    if (!result.ok) { feedback = result.feedback; retryAfter = result.retryAfter; return false; }
    if (recovery?.recovery_id !== result.value.recovery_id || !isActive(result.value)) {
      delivery = {};
      pendingDeliveries = [];
    }
    recovery = result.value; feedback = 'saved'; return true;
  }
  async function refresh() {
    if (busy) return; startAction('refresh');
    try { acceptRecovery(await port.readRecovery()); } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function startRecovery() {
    if (busy || !recovery || activeRecovery) return; startAction('start');
    try { acceptRecovery(await port.startRecovery()); } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function continueNotifications() {
    if (busy || recovery?.state !== 'notifying' || !recovery.recovery_id || !hasPendingNotifications) return;
    startAction('notices');
    try { acceptRecovery(await port.continueRecoveryNotifications({recovery_id:recovery.recovery_id})); }
    catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function requestContact(slot:OwnerAccessContactSlot) {
    if (busy || recovery?.state !== 'collecting' || !recovery.recovery_id) return;
    startAction(slot);
    try {
      const result = await port.requestContact({recovery_id:recovery.recovery_id,slot});
      if (!result.ok) {
        if (result.feedback === 'unconfirmed' && !pendingDeliveries.includes(slot)) pendingDeliveries = [...pendingDeliveries,slot];
        feedback = result.feedback; retryAfter = result.retryAfter; return;
      }
      pendingDeliveries = pendingDeliveries.filter(item => item !== slot);
      delivery = {...delivery,[slot]:result.value};
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function deliveryStatus(slot:OwnerAccessContactSlot) {
    const challenge = delivery[slot]; if (busy || !recovery?.recovery_id || !challenge) return;
    startAction(slot);
    try {
      const result = await port.contactDeliveryStatus({recovery_id:recovery.recovery_id,slot,challenge_id:challenge.challenge_id});
      if (!result.ok) { feedback = result.feedback; retryAfter = result.retryAfter; return; }
      delivery = {...delivery,[slot]:result.value};
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function confirmContact(event:SubmitEvent, slot:OwnerAccessContactSlot) {
    event.preventDefault(); if (busy || !recovery?.recovery_id) return;
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form);
    let code = String(values.get('code') ?? ''); form.reset(); values.forEach((_v,key)=>values.delete(key));
    const challenge = delivery[slot]; if (!challenge || challenge.delivery_status !== 'accepted' || Date.parse(challenge.expires_at) <= Date.now()) { code = ''; return; }
    startAction(slot);
    try {
      const result = await port.confirmContact({recovery_id:recovery.recovery_id,slot,
        challenge_id:challenge.challenge_id,code});
      code = ''; if (!acceptRecovery(result)) return;
      delete delivery[slot]; delivery = {...delivery};
      pendingDeliveries = pendingDeliveries.filter(item => item !== slot); feedback = 'saved';
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function vetoContact(event:SubmitEvent) {
    event.preventDefault(); if (busy || !recovery?.recovery_id) return;
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form);
    const slot = String(values.get('slot') ?? '') as OwnerAccessContactSlot;
    let token = String(values.get('veto_token') ?? ''); form.reset(); values.forEach((_v,key)=>values.delete(key));
    if (!slots.includes(slot) || !token) { token = ''; return; }
    startAction('receipt');
    try {
      const result = await port.vetoContact({recovery_id:recovery.recovery_id,slot,veto_token:token});
      token = ''; acceptRecovery(result);
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
  async function runCeremony(operation:OwnerAccessRecoveryCeremony) {
    if (busy || !activeRecovery || !recovery?.recovery_id || (operation === 'rebind' && !rebindAvailable)) return;
    const label = operation === 'rebind' ? rebindLabel.trim() : undefined;
    if (operation === 'rebind' && (!label || Array.from(label).length > 80)) return;
    startAction(operation);
    const signal = ceremonyLifetime.signal;
    try {
      const begin = await port.beginRecoveryCeremony({operation,recovery_id:recovery.recovery_id});
      if (signal.aborted) return;
      if (!begin.ok) { feedback = begin.feedback; retryAfter = begin.retryAfter; return; }
      let credential;
      feedback = 'checking_passkey';
      try { credential = begin.value.kind === 'registration'
        ? await register(begin.value.options,{timeoutMs:60000,signal})
        : await authenticate(begin.value.options,{timeoutMs:60000,signal}); }
      catch (error) {
        feedback = passkeyFailure(error);
        return;
      }
      if (signal.aborted) return;
      feedback = null;
      const complete = await port.completeRecoveryCeremony({operation,recovery_id:recovery.recovery_id,
        ceremony_id:begin.value.ceremony_id,credential,...(label ? {label} : {})});
      credential = undefined;
      if (acceptRecovery(complete)) rebindLabel = '';
    } catch { feedback = 'unconfirmed'; } finally { busy = false; }
  }
</script>

{#snippet result(target: Action)}
  {#if action === target}
    {#if feedback && feedback !== 'saved'}
      <p class="result" role={feedback === 'checking_passkey' ? 'status' : 'alert'}>
        {m[feedback === 'unavailable' ? 'unavailableMessage' : feedback]}
        {#if retryAfter !== null}{m.retryAfter} {retryAfter}{/if}
      </p>
    {:else if busy}
      <p class="result" role="status">{m.wait}</p>
    {:else if feedback === 'saved' && (target === 'refresh' || target === 'notices')}
      <p class="result" role="status">{m.saved}</p>
    {/if}
  {/if}
{/snippet}

<section class="owner-access" aria-labelledby={titleId}>
  <header>
    <h2 id={titleId}>{m.title}</h2>
    {#if localPreview}<p role="status">{m.preview}</p>{/if}
  </header>
  <div class="section-nav" role="group" aria-label={m.title}>
    {#if enrollment}
      <button class="zdp-button zdp-button--md zdp-button--secondary" type="button" aria-pressed={section === 'enrollment'} disabled={!mounted || busy || enrollmentBusy}
        onclick={() => openSection('enrollment')}>{m.enrollment}</button>
    {/if}
    <button class="zdp-button zdp-button--md zdp-button--secondary" type="button" aria-pressed={section === 'approval'} disabled={!mounted || busy || enrollmentBusy}
      onclick={() => openSection('approval')}>{m.approval}</button>
    <button class="zdp-button zdp-button--md zdp-button--secondary" type="button" aria-pressed={section === 'recovery'} disabled={!mounted || busy || enrollmentBusy}
      onclick={() => openSection('recovery')}>{m.recovery}{#if activeRecovery} · {m.active}{/if}</button>
  </div>

  {#if section === 'enrollment' && enrollment}
    {@render enrollment()}
  {:else if section === 'approval'}
    <Surface>
      <h3 id={panelTitle}>{m.approval}</h3><p>{m.approvalIntro}</p>
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
      {@render result('approval')}
    </Surface>

  {:else}
    <Surface>
      <div class="recovery-status">
        <div>
          <h3 id={panelTitle}>{m.recovery}</h3>
          {#if recovery && recovery.state !== 'none'}
            <p class="state" role="status">{rebindAvailable ? m.steps[3] : m.states[recovery.state]}</p>
          {/if}
        </div>
        <div>
          <Button type="button" disabled={busy || !mounted} onclick={() => void refresh()}>{m.refresh}</Button>
          {@render result('refresh')}
        </div>
      </div>

      {#if !recovery}
        <p role="status">{m.unavailableMessage}</p>
      {:else if !activeRecovery}
        <p>{m.recoveryIntro}</p>
        {#if recovery.state === 'none'}<p role="status">{m.notStarted}</p>{/if}
      {/if}

      {#if !activeRecovery}
        <Button type="button" disabled={busy || !recovery} onclick={() => void startRecovery()}>{m.start}</Button>
        {@render result('start')}
      {:else if recovery}
        <ol class="steps" aria-label={m.recoverySteps}>
          {#each m.steps as step, index}
            <li class:done={index < activeStep} aria-current={index === activeStep ? 'step' : undefined}>
              <span class="step-number" aria-hidden="true">{index < activeStep ? '✓' : index + 1}</span>{step}
            </li>
          {/each}
        </ol>

        {#if recovery.state === 'collecting'}
          <div class="step-content">
            <h4>{m.steps[0]} · {Math.min(2, recovery.proof_slots.length)}/2</h4>
            <p>{m.chooseContacts}</p>
            <div class="contacts">
              {#each slots as slot}
                {@const proof = recovery.proof_slots.includes(slot)}
                {@const status = delivery[slot]?.delivery_status}
                {@const expired = delivery[slot] && Date.parse(delivery[slot].expires_at) <= now}
                <div class="contact">
                  <strong>{m[slot]}</strong>
                  {#if proof}
                    <span role="status">{m.verified}</span>
                  {:else if status === 'accepted' && !expired}
                    <p role="status">{m.codeSent}</p>
                    <form method="post" action="" autocomplete="off" onsubmit={event => void confirmContact(event,slot)}>
                      <fieldset disabled={busy}>
                        <label>{m.code}<input name="code" type="text" inputmode="numeric" required pattern={'[0-9]{6}'}
                          minlength="6" maxlength="6" autocomplete="one-time-code" /></label>
                        <Button type="submit">{m.confirmCode}</Button>
                      </fieldset>
                    </form>
                  {:else if status === 'unknown' || status === 'pending'}
                    <p role="status">{m.noAutoResend}</p>
                    <Button type="button" disabled={busy} onclick={() => void deliveryStatus(slot)}>{m.recheckSend}</Button>
                  {:else}
                    {#if status === 'rejected'}<p role="alert">{m.codeRejected}</p>
                    {:else if expired}<p role="status">{m.codeExpired}</p>{/if}
                    <Button type="button" disabled={busy} onclick={() => void requestContact(slot)}>
                      {pendingDeliveries.includes(slot) ? m.recheckSend : m.sendCode}
                    </Button>
                  {/if}
                  {@render result(slot)}
                </div>
              {/each}
            </div>
          </div>
        {:else if recovery.state === 'notifying'}
          <div class="step-content">
            <h4>{m.steps[1]}</h4>
            <p>{m.notificationPolicies[recovery.notification_policy]}</p>
            <p>{m.waitForNotices}</p>
            <ul class="notice-list">
              {#each noticeSlots as slot}
                {@const notice = recovery.notifications.find(item => item.slot === slot)}
                <li><span>{m[slot]}</span><strong>{m[notice?.status ?? 'pending']}</strong></li>
              {/each}
            </ul>
            {#if hasPendingNotifications}
              <Button type="button" disabled={busy} onclick={() => void continueNotifications()}>{m.continueNotifications}</Button>
              {@render result('notices')}
            {/if}
          </div>
        {:else if rebindAvailable}
          <div class="step-content">
            <h4>{m.steps[3]}</h4>
            <label>{m.label}<input bind:value={rebindLabel} type="text" maxlength="80" autocomplete="off" /></label>
            <Button type="button" disabled={busy || !rebindLabel.trim()} onclick={() => void runCeremony('rebind')}>{m.bind}</Button>
            {@render result('rebind')}
          </div>
        {:else if recovery.ready_at}
          <div class="step-content">
            <h4>{m.steps[2]}</h4>
            <p>{m.ready} <strong><time datetime={recovery.ready_at}>{displayTime(recovery.ready_at)}</time></strong></p>
          </div>
        {/if}

        <aside class="cancel-card" aria-label={m.veto}>
          <h4>{m.veto}</h4>
          <Button type="button" disabled={busy} onclick={() => void runCeremony('veto')}>{m.passkeyVeto}</Button>
          {@render result('veto')}
          {#if recovery.state !== 'collecting'}
            <details>
              <summary>{m.vetoContact}</summary>
              <p>{m.vetoHelp}</p>
              <form method="post" action="" autocomplete="off" onsubmit={vetoContact}>
                <fieldset disabled={busy}>
                  <label>{m.slot}<select name="slot" required>{#each noticeSlots as slot}<option value={slot}>{m[slot]}</option>{/each}</select></label>
                  <label>{m.vetoToken}<input name="veto_token" type="password" required autocomplete="off" /></label>
                  <Button type="submit">{m.vetoContact}</Button>
                </fieldset>
              </form>
              {@render result('receipt')}
            </details>
          {/if}
        </aside>
      {/if}
      <p class="scope">{m.noWalletReset}</p>
    </Surface>
  {/if}
</section>

<style>
  .owner-access { display: grid; gap: var(--zdp-space-4); min-width: 0; }
  header h2, .recovery-status h3, .step-content h4, .cancel-card h4 { margin: 0; }
  .section-nav, .recovery-status { display: flex; flex-wrap: wrap; gap: var(--zdp-space-3); align-items: start; }
  .section-nav [aria-pressed='true'] { outline: 2px solid currentColor; outline-offset: -4px; font-weight: var(--zdp-font-weight-bold); }
  .recovery-status { justify-content: space-between; }
  .state { margin: var(--zdp-space-2) 0 0; font-weight: var(--zdp-font-weight-bold); }
  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--zdp-space-8) * 4)), 1fr)); gap: var(--zdp-space-2); padding: 0; list-style: none; margin-block: var(--zdp-space-4); }
  .steps li { display: flex; align-items: center; gap: var(--zdp-space-2); padding: var(--zdp-space-2); border-block-end: 1px solid var(--zdp-color-border); }
  .steps li[aria-current='step'] { border-block-end: 2px solid currentColor; font-weight: var(--zdp-font-weight-bold); }
  .step-number { display: grid; place-items: center; border: 1px solid var(--zdp-color-border); border-radius: 50%; inline-size: calc(var(--zdp-space-6) + var(--zdp-space-1)); block-size: calc(var(--zdp-space-6) + var(--zdp-space-1)); flex: none; }
  .steps .done .step-number, .steps li[aria-current='step'] .step-number { border-color: currentColor; }
  .step-content, .cancel-card, .contact { display: grid; gap: var(--zdp-space-3); justify-items: start; min-width: 0; }
  .step-content p, .contact p, .result { margin: 0; }
  .contacts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--zdp-space-10) * 6)), 1fr)); gap: var(--zdp-space-3); width: 100%; }
  .contact, .cancel-card { padding: var(--zdp-space-3); border: 1px solid var(--zdp-color-border); border-radius: var(--zdp-radius-sm); }
  .cancel-card, .scope { margin-block-start: var(--zdp-space-4); }
  .notice-list { display: grid; gap: var(--zdp-space-2); width: 100%; padding: 0; margin: 0; list-style: none; }
  .notice-list li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--zdp-space-2); padding-block: var(--zdp-space-2); border-block-end: 1px solid var(--zdp-color-border); }
  .approval-recovery { margin-block: var(--zdp-space-3); }
  .result { margin-block-start: var(--zdp-space-2); overflow-wrap: anywhere; }
  .result[role='alert'] { border-inline-start: 2px solid var(--zdp-color-accent-danger); padding-inline-start: var(--zdp-space-2); }
  fieldset { border: 0; padding: 0; display: grid; gap: var(--zdp-space-3); min-width: 0; justify-items: start; }
  label { display: grid; gap: var(--zdp-space-2); width: 100%; }
  input, select, textarea { box-sizing: border-box; font: inherit; padding: var(--zdp-space-3); width: 100%; color: inherit; background: var(--zdp-color-surface); border: 1px solid var(--zdp-color-border); border-radius: var(--zdp-radius-sm); }
  textarea { resize: vertical; }
  dl { display: grid; grid-template-columns: minmax(calc(var(--zdp-space-8) * 3), auto) minmax(0, 1fr); gap: var(--zdp-space-2) var(--zdp-space-3); overflow-wrap: anywhere; }
  dd { margin: 0; }
</style>
