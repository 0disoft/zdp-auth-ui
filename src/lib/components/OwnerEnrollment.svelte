<script lang="ts">
  import { Button, Surface } from 'zdp-design-system';
  import { onMount } from 'svelte';
  import { ownerContactSlots, ownerContactsReady, type OwnerEnrollment as OwnerEnrollmentState, type OwnerEnrollmentAction, type OwnerEnrollmentFeedback, type OwnerContactSlot } from '../owner-enrollment';
  import { getOwnerEnrollmentMessages } from '../owner-enrollment-messages';
  interface Props {
    locale?: string; state?: OwnerEnrollmentState | null; busy?: boolean; feedback?: OwnerEnrollmentFeedback;
    retryAfter?: number | null; lockedSlots?: readonly OwnerContactSlot[]; blocked?: boolean; localPreview?: boolean;
    passkeys?: readonly { passkey_id: string; label: string }[]; securityHref: string;
    onaction: (action: OwnerEnrollmentAction) => void; onrefresh: () => void;
  }
  let { locale = 'en', state: enrollment = null, busy = false, feedback = null, retryAfter = null, lockedSlots = [], blocked = false,
    localPreview = false, passkeys = [], securityHref, onaction, onrefresh }: Props = $props();
  let m = $derived(getOwnerEnrollmentMessages(locale));
  let mounted = $state(false);
  onMount(() => { mounted = true; });
  // Read native fields only on explicit submit. Reset all private controls before handing values to the consumer.
  function submit(event: SubmitEvent, action: 'request' | 'confirm' | 'bind', slot?: OwnerContactSlot, attempt_id?: string | null) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!mounted || busy || blocked || !enrollment?.enabled) { form.reset(); return; }
    const values = new FormData(form); form.reset();
    const value = (name: string) => String(values.get(name) ?? '');
    if (action === 'request' && slot) onaction({ action, slot, contact: value('contact'), current_password: value('current_password'),
      ...(slot.startsWith('phone') && values.get('sms_opt_in') === 'on' ? { sms_opt_in: true as const } : {}) });
    if (action === 'confirm' && slot && attempt_id) onaction({ action, slot, attempt_id, code: value('code') });
    if (action === 'bind') onaction({ action, passkey_id: value('passkey_id'), current_password: value('current_password') });
    for (const key of [...values.keys()]) values.delete(key);
  }
</script>
<section aria-labelledby="owner-enrollment-title" aria-busy={busy}>
  <h1 id="owner-enrollment-title">{m.title}</h1>
  <p>{m.intro}</p>
  {#if localPreview}<p role="status">{m.preview}</p>{/if}
  <p>{m.scope}</p>
  {#if feedback}<p role={feedback === 'saved' ? 'status' : 'alert'}>{m[feedback]} {#if retryAfter !== null}{m.retryAfter} {retryAfter}{/if}</p>{/if}
  <Button type="button" disabled={busy || !mounted} onclick={onrefresh}>{busy ? m.wait : m.refresh}</Button>
  {#if !enrollment?.enabled}<p role="status">{m.unavailable}</p>
  {:else}
    <p>{m.limits}</p>
    {#each ownerContactSlots as slot}
      {@const item = enrollment.slots.find(s => s.slot === slot)}
      {@const phone = slot.startsWith('phone')}
      <Surface>
        <h2>{m[slot]}</h2>
        {#if item}
          <p>{m[item.status]} {item.masked_contact ?? ''}</p>
          {#if item.delivery_status && item.status === 'pending'}<p role="status">{m[item.delivery_status]}</p>{/if}
          {#if item.status === 'not_set' || item.delivery_status === 'rejected'}
            <form method="post" action="" autocomplete="off" onsubmit={event => submit(event, 'request', slot)}>
              <fieldset disabled={!mounted || busy || blocked || lockedSlots.includes(slot)}>
                <label>{m.contact}<input name="contact" type={phone ? 'tel' : 'email'} required maxlength="254" autocomplete="off" pattern={phone ? '\\+[1-9][0-9]{7,14}' : undefined} /></label>
                {#if phone}<p>{m.phoneHelp}</p><label><input name="sms_opt_in" type="checkbox" required />{m.consent}</label>{/if}
                <label>{m.password}<input name="current_password" type="password" required maxlength="128" autocomplete="off" /></label>
                <Button type="submit">{item.delivery_status === 'rejected' ? m.retry : m.request}</Button>
              </fieldset>
            </form>
          {/if}
          {#if item.status === 'pending' && item.delivery_status !== 'rejected'}
            <form method="post" action="" autocomplete="off" onsubmit={event => submit(event, 'confirm', slot, item.attempt_id)}>
              <fieldset disabled={!mounted || busy || blocked}>
                <label>{m.code}<input name="code" type="text" inputmode="numeric" required pattern={'[0-9]{6}'} minlength="6" maxlength="6" autocomplete="off" /></label>
                <Button type="submit">{m.confirm}</Button>
              </fieldset>
            </form>
          {/if}
        {/if}
      </Surface>
    {/each}
    <Surface>
      <h2>{m.passkey}</h2>
      {#if ownerContactsReady(enrollment)}<a class="zdp-link" href={securityHref}>{m.security}</a>{/if}
      {#if enrollment.passkey.status === 'bound'}<p role="status">{m.bound}</p>
      {:else if !ownerContactsReady(enrollment)}<p>{m.prerequisite}</p>
      {:else if passkeys.length === 0}<p>{m.none}</p>
      {:else}
        <form method="post" action="" autocomplete="off" onsubmit={event => submit(event, 'bind')}>
          <fieldset disabled={!mounted || busy || blocked}>
            <label>{m.choose}<select name="passkey_id" required><option value="">{m.choose}</option>{#each passkeys as p}<option value={p.passkey_id}>{p.label}</option>{/each}</select></label>
            <label>{m.password}<input name="current_password" type="password" required maxlength="128" autocomplete="off" /></label>
            <Button type="submit">{m.bind}</Button>
          </fieldset>
        </form>
      {/if}
    </Surface>
  {/if}
</section>
<style>
  section { display: grid; gap: var(--zdp-space-4); max-width: 100%; }
  fieldset { border: 0; padding: 0; display: grid; gap: var(--zdp-space-3); min-width: 0; }
  label { display: grid; gap: var(--zdp-space-2); }
  input, select { font: inherit; padding: var(--zdp-space-3); max-width: 100%; color: inherit; background: var(--zdp-color-surface); border: var(--zdp-border-width, thin) solid var(--zdp-color-border); border-radius: var(--zdp-radius-sm); }
  input[type='checkbox'] { justify-self: start; }
</style>
