<script lang="ts">
  import { Badge, Button, Field, HelpText, Input, Label, Select, Surface } from 'zdp-design-system';
  import { onMount, tick } from 'svelte';
  import PasswordField from './PasswordField.svelte';
  import { getPasskeyRegistrationDefaultLabel, getPasskeySettingsMessages } from '../passkey-settings-messages';
  import { isZdpPasskeyAuthenticatorProvider, isZdpPasskeyAuthenticatorStorage,
    isZdpPasskeyRegistrationPreference, validPasskeyLabel, zdpPasskeyRegistrationPreferenceDefault,
    zdpPasskeyRegistrationPreferences, type ZdpPasskeyAuthenticator,
    type ZdpPasskeySettingsAction, type ZdpPasskeySettingsFeedback,
    type ZdpPasskeySettingsState } from '../passkey-settings-contract';

  export let locale = 'en';
  export let idPrefix = 'passkey-settings';
  export let state: ZdpPasskeySettingsState = { status: 'preparing', passkeys: [],
    capabilities: { register: false, rename: false, revoke: false }, reauthentication: 'password' };
  export let busy = false;
  export let feedback: ZdpPasskeySettingsFeedback = null;
  export let feedbackSequence: number | null = null;
  export let onaction: ((detail: ZdpPasskeySettingsAction, event: SubmitEvent) => void) | null = null;

  let editor: 'register' | 'rename' | 'revoke' | null = null;
  let selectedId = '';
  let name = '';
  let nameEdited = false;
  let preferenceValue: string = zdpPasskeyRegistrationPreferenceDefault;
  let password = '';
  let touched = false;
  let mounted = false;
  let sameTask = false;
  let submitted = false;
  let actionSequence = 0;
  let submittedFeedback: ZdpPasskeySettingsFeedback = null;
  let feedbackChanged = false;
  let editorElement: HTMLDivElement;
  let feedbackElement: HTMLParagraphElement;
  let returnFocus: HTMLElement | null = null;
  const providerLabels = {
    windows_hello: 'providerWindowsHello',
    google_password_manager: 'providerGooglePasswordManager',
    bitwarden: 'providerBitwarden',
    apple_passwords: 'providerApplePasswords',
    unknown: 'providerUnknown'
  } as const;
  const preferenceLabels = {
    device: 'preferenceDevice',
    manager: 'preferenceManager',
    security_key: 'preferenceSecurityKey',
    phone: 'preferencePhone'
  } as const;
  $: copy = getPasskeySettingsMessages(locale);
  $: preference = isZdpPasskeyRegistrationPreference(preferenceValue)
    ? preferenceValue : zdpPasskeyRegistrationPreferenceDefault;
  $: suggestedName = editor === 'register'
    ? getPasskeyRegistrationDefaultLabel(locale, preference) : '';
  $: if (editor === 'register' && !nameEdited) name = suggestedName;
  $: ready = state.status === 'ready';
  $: currentFeedback = feedbackSequence === null || feedbackSequence === actionSequence ? feedback : null;
  $: locked = busy || !ready || !onaction || currentFeedback === 'unconfirmed';
  $: permitted = editor !== null && state.capabilities[editor];
  $: nameInvalid = editor !== 'revoke' && !validPasskeyLabel(name);
  $: passwordInvalid = Array.from(password).length < 12 || Array.from(password).length > 128;
  $: if (submitted && currentFeedback !== submittedFeedback) feedbackChanged = true;
  $: if (submitted && !busy && currentFeedback === 'saved' && editor &&
    (feedbackSequence !== null ? feedbackSequence === actionSequence : feedbackChanged)) close(false);
  $: if (!busy && editor && (!ready || !permitted)) close(false);
  $: if (mounted && currentFeedback && !busy) {
    const expectedSequence = actionSequence;
    const expectedFeedback = currentFeedback;
    void tick().then(() => {
      if (!busy && expectedSequence === actionSequence && currentFeedback === expectedFeedback) feedbackElement?.focus();
    });
  }
  onMount(() => { mounted = true; });

  async function open(action: typeof editor, id = '', label = '') {
    if (locked || !action || !state.capabilities[action]) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    editor = action; selectedId = id; name = label; password = ''; touched = false; submitted = false;
    nameEdited = action !== 'register';
    preferenceValue = zdpPasskeyRegistrationPreferenceDefault;
    await tick();
    editorElement?.querySelector<HTMLInputElement>('input')?.focus();
  }
  function close(restoreFocus = true) {
    if (busy) return;
    editor = null; selectedId = ''; name = ''; password = ''; touched = false; submitted = false;
    nameEdited = false; preferenceValue = zdpPasskeyRegistrationPreferenceDefault;
    if (restoreFocus) returnFocus?.focus();
  }
  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (locked || !editor || !permitted || sameTask) return;
    touched = true;
    if (nameInvalid && editor !== 'revoke') return;
    if (editor !== 'rename' && state.reauthentication === 'password' &&
        passwordInvalid) return;
    sameTask = true;
    queueMicrotask(() => { sameTask = false; });
    const currentPassword = state.reauthentication === 'password' ? password : undefined;
    const detail: ZdpPasskeySettingsAction = editor === 'register'
      ? { action: editor, label: name.trim(), preference, currentPassword }
      : editor === 'rename' ? { action: editor, passkeyId: selectedId, label: name.trim() }
      : { action: editor, passkeyId: selectedId, currentPassword };
    // The consumer receives the immediate value; the component retains no verifier after handoff.
    password = '';
    submittedFeedback = currentFeedback;
    feedbackChanged = false;
    submitted = true;
    onaction?.({ ...detail, sequence: ++actionSequence }, event);
  }
  function date(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return copy.unavailable;
    try { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed); }
    catch { return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(parsed); }
  }
  function providerLabel(authenticator: ZdpPasskeyAuthenticator): string {
    const provider = authenticator.provider;
    return isZdpPasskeyAuthenticatorProvider(provider)
      ? copy[providerLabels[provider]] : copy.providerUnknown;
  }
  function storageLabel(authenticator: ZdpPasskeyAuthenticator): string {
    const storage = !isZdpPasskeyAuthenticatorStorage(authenticator.storage) ? copy.storageUnknown
      : authenticator.storage === 'synced' ? copy.storageSynced : copy.storageDeviceBound;
    return `${storage} · ${authenticator.backed_up ? copy.backedUp : copy.notBackedUp}`;
  }
</script>

<Surface padding="lg">
  <section class="zdp-passkey-settings" aria-labelledby={`${idPrefix}-title`} aria-busy={busy}>
    <header>
      <div><h2 id={`${idPrefix}-title`}>{copy.title}</h2><p>{copy.description}</p></div>
      {#if ready && state.capabilities.register}
        <Button type="button" variant="secondary" disabled={locked} onclick={() => open('register')}>
          {copy.add}
        </Button>
      {/if}
    </header>
    {#if !ready}
      <p role="status">{state.status === 'preparing' ? copy.preparing : copy.unavailable}</p>
    {:else}
      {#if state.passkeys.length === 0}<p>{copy.empty}</p>{/if}
      <ul>
        {#each state.passkeys as key (key.passkey_id)}
          <li>
            <div>
              <div class="zdp-passkey-settings__identity">
                <strong>{key.label}</strong>
                <Badge tone="neutral" size="sm">{key.authenticator ? providerLabel(key.authenticator) : copy.providerUnknown}</Badge>
              </div>
              <p>{copy.created}: {date(key.created_at)} · {copy.lastUsed}: {key.last_used_at ? date(key.last_used_at) : copy.neverUsed}</p>
              <p>{key.authenticator ? storageLabel(key.authenticator) : copy.storageUnknown}</p>
            </div>
            <div class="zdp-passkey-settings__actions">
              {#if state.capabilities.rename}<Button type="button" variant="secondary" disabled={locked} onclick={() => open('rename', key.passkey_id, key.label)}>{copy.rename}</Button>{/if}
              {#if state.capabilities.revoke}<Button type="button" variant="secondary" disabled={locked} onclick={() => open('revoke', key.passkey_id, key.label)}>{copy.remove}</Button>{/if}
            </div>
          </li>
        {/each}
      </ul>
      {#if editor}
        <div class="zdp-passkey-settings__editor" bind:this={editorElement}>
          <form method="post" onsubmit={submit}>
            <fieldset disabled={locked}>
              <legend>{editor === 'register' ? copy.add : editor === 'rename' ? copy.rename : `${copy.remove}: ${name}`}</legend>
              {#if editor === 'revoke'}<p>{copy.removeHelp}</p>{:else}
                {#if editor === 'register'}
                  <Field>
                    <Label forId={`${idPrefix}-preference`}>{copy.preferenceLabel}</Label>
                    <Select id={`${idPrefix}-preference`} name="preference" bind:value={preferenceValue}
                      describedBy={`${idPrefix}-preference-help`} disabled={locked}>
                      {#each zdpPasskeyRegistrationPreferences as option (option)}
                        <option value={option}>{copy[preferenceLabels[option]]}</option>
                      {/each}
                    </Select>
                    <HelpText id={`${idPrefix}-preference-help`}>{copy.preferenceHelp}</HelpText>
                  </Field>
                {/if}
                <Field invalid={touched && nameInvalid}>
                  <Label forId={`${idPrefix}-name`}>{copy.name}</Label>
                  <Input id={`${idPrefix}-name`} name="label" bind:value={name} required
                    oninput={() => (nameEdited = true)}
                    describedBy={touched && nameInvalid ? `${idPrefix}-name-error` : null} />
                  {#if touched && nameInvalid}<p id={`${idPrefix}-name-error`} role="alert">{copy.invalidName}</p>{/if}
                </Field>
              {/if}
              {#if editor !== 'rename'}
                <p>{state.reauthentication === 'passkey' ? copy.reauthPasskey : copy.reauthPassword}</p>
                {#if state.reauthentication === 'password'}
                  <PasswordField id={`${idPrefix}-password`} name="current_password" {locale} bind:value={password}
                    label={copy.currentPassword} autocomplete="current-password" required disabled={locked} />
                  {#if touched && passwordInvalid}<p role="alert">{copy.invalidPassword}</p>{/if}
                {/if}
              {/if}
              <div class="zdp-passkey-settings__actions">
                <Button type="button" variant="secondary" disabled={locked} onclick={() => close()}>{copy.cancel}</Button>
                <Button type="submit" disabled={locked}>{editor === 'revoke' ? copy.confirmRemove : editor === 'register' ? copy.add : copy.save}</Button>
              </div>
            </fieldset>
          </form>
        </div>
      {/if}
    {/if}
    {#if busy}<p role="status" aria-live="polite">{copy.waiting}</p>
    {:else if currentFeedback}<p bind:this={feedbackElement} role={currentFeedback === 'saved' ? 'status' : 'alert'} tabindex="-1">{copy[currentFeedback]}</p>{/if}
  </section>
</Surface>

<style>
  .zdp-passkey-settings { display: grid; gap: var(--zdp-space-4); min-width: 0; color: var(--zdp-color-ink-normal); }
  header, li { display: flex; align-items: center; justify-content: space-between; gap: var(--zdp-space-4); min-width: 0; }
  h2, p { margin: 0; overflow-wrap: anywhere; }
  h2 { font-size: var(--zdp-type-section-title-size); color: var(--zdp-color-ink-strong); }
  header > div, li > div:first-child { display: grid; gap: var(--zdp-space-2); min-width: 0; }
  .zdp-passkey-settings__identity { display: flex; align-items: center; gap: var(--zdp-space-2); flex-wrap: wrap; min-width: 0; }
  p { color: var(--zdp-color-ink-muted); }
  ul { list-style: none; padding: 0; margin: 0; display: grid; }
  li { padding-block: var(--zdp-space-4); border-top: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle); }
  .zdp-passkey-settings__actions { display: flex; justify-content: flex-end; gap: var(--zdp-space-2); flex-wrap: wrap; }
  .zdp-passkey-settings__editor { border-top: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle); padding-top: var(--zdp-space-4); }
  fieldset { display: grid; gap: var(--zdp-space-3); border: 0; padding: 0; margin: 0; min-width: 0; }
  legend { margin-bottom: var(--zdp-space-3); font-weight: var(--zdp-font-weight-semibold); }
  @media (max-width: 40rem) { li { align-items: flex-start; flex-direction: column; } li > .zdp-passkey-settings__actions { align-self: flex-end; } }
</style>
