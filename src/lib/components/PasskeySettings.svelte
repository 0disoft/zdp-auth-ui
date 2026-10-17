<script lang="ts">
  import { Badge, Button, Field, HelpText, Input, Label, Menu, Select, Surface } from 'zdp-design-system';
  import { onMount, tick, type Component, type ComponentProps, type Snippet } from 'svelte';
  import type { ZdpAuthMessages } from '../i18n';
  import PasswordField from './PasswordField.svelte';
  import type { ZdpPasskeySettingsMessages } from '../passkey-settings-messages';
  import { isZdpPasskeyAuthenticatorProvider, isZdpPasskeyAuthenticatorStorage,
    isZdpPasskeyRegistrationPreference, validPasskeyLabel, zdpPasskeyRegistrationPreferenceDefault,
    zdpPasskeyRegistrationPreferences, type ZdpPasskeyAuthenticator,
    type ZdpPasskeySettingsAction, type ZdpPasskeySettingsFeedback,
    type ZdpPasskeySettingsState } from '../passkey-settings-contract';

  // Menu supports Svelte's slot/snippet interop, but its published Props omit this named snippet.
  const MenuWithTrigger: Component<ComponentProps<typeof Menu> & { trigger: Snippet }> = Menu;

  interface Props {
    messages: ZdpPasskeySettingsMessages;
    authMessages: ZdpAuthMessages;
    locale?: string;
    idPrefix?: string;
    state?: ZdpPasskeySettingsState;
    busy?: boolean;
    feedback?: ZdpPasskeySettingsFeedback;
    feedbackSequence?: number | null;
    layout?: 'default' | 'directory';
    heading?: Snippet<[{ add: () => void; disabled: boolean; titleId: string }]>;
    itemIcon?: Snippet;
    actionIcon?: Snippet;
    onaction?: ((detail: ZdpPasskeySettingsAction, event: SubmitEvent) => void) | null;
  }

  let {
    messages,
    authMessages,
    locale = 'en',
    idPrefix = 'passkey-settings',
    state: settingsState = { status: 'preparing', passkeys: [],
    capabilities: { register: false, rename: false, revoke: false }, reauthentication: 'password' },
    busy = false,
    feedback = null,
    feedbackSequence = null,
    layout = 'default',
    heading,
    itemIcon,
    actionIcon,
    onaction = null
  }: Props = $props();

  let editor: 'register' | 'rename' | 'revoke' | null = $state(null);
  let selectedId = $state('');
  // null means an untouched suggestion; an empty string is an intentional edit.
  let enteredName: string | null = $state(null);
  let preferenceValue: string = $state(zdpPasskeyRegistrationPreferenceDefault);
  let password = $state('');
  let touched = $state(false);
  let mounted = $state(false);
  let sameTask = false;
  let submitted = $state(false);
  let actionSequence = $state(0);
  let submittedFeedback: ZdpPasskeySettingsFeedback = $state(null);
  let feedbackChanged = $state(false);
  let settingsElement: HTMLElement | undefined = $state();
  let editorElement: HTMLDivElement | undefined = $state();
  let feedbackElement: HTMLParagraphElement | undefined = $state();
  let returnFocus: HTMLElement | null = null;
  let focusRequest = 0;
  let menuId = $state<string | null>(null);
  const providerLabels = {
    windows_hello: 'providerWindowsHello',
    google_password_manager: 'providerGooglePasswordManager',
    bitwarden: 'providerBitwarden',
    apple_passwords: 'providerApplePasswords',
    unknown: 'providerUnknown'
  } as const;
  const defaultNameKeys = {
    device: 'defaultNameDevice', manager: 'defaultNameManager',
    security_key: 'defaultNameSecurityKey', phone: 'defaultNamePhone'
  } as const;
  const preferenceLabels = {
    device: 'preferenceDevice',
    manager: 'preferenceManager',
    security_key: 'preferenceSecurityKey',
    phone: 'preferencePhone'
  } as const;
  onMount(() => { mounted = true; });

  function activeElement(): HTMLElement | null {
    const root = settingsElement?.getRootNode();
    const active = root && 'activeElement' in root ? root.activeElement : null;
    return active instanceof HTMLElement ? active : null;
  }
  function menuTrigger(event: MouseEvent): HTMLElement | null {
    const item = event.currentTarget;
    const menu = item instanceof HTMLElement ? item.closest('.zdp-passkey-settings__menu') : null;
    return menu && settingsElement?.contains(menu)
      ? menu.querySelector<HTMLElement>('button[aria-haspopup="menu"]') : null;
  }
  async function open(action: typeof editor, id = '', label = '', focusTarget?: HTMLElement | null) {
    if (locked || !action || !settingsState.capabilities[action]) return;
    const request = ++focusRequest;
    returnFocus = focusTarget ?? activeElement();
    menuId = null;
    editor = action; selectedId = id; enteredName = action === 'register' ? null : label;
    password = ''; touched = false; submitted = false;
    preferenceValue = zdpPasskeyRegistrationPreferenceDefault;
    await tick();
    if (request !== focusRequest || editor !== action || locked || !editorElement?.isConnected) return;
    (editorElement.querySelector<HTMLElement>('input:not(:disabled)')
      ?? editorElement.querySelector<HTMLElement>('legend'))?.focus();
  }
  async function restoreEditorFocus(request: number, target: HTMLElement | null) {
    await tick();
    if (request !== focusRequest || editor || !settingsElement?.isConnected) return;
    const destination = target?.isConnected && settingsElement.contains(target) &&
      !target.matches(':disabled') && !target.closest('[inert]') ? target : settingsElement;
    destination.focus();
    if (activeElement() !== destination) settingsElement.focus();
  }
  function close(restoreFocus = true) {
    if (busy) return;
    const request = ++focusRequest;
    const target = returnFocus;
    returnFocus = null;
    editor = null; selectedId = ''; enteredName = null; password = ''; touched = false; submitted = false;
    preferenceValue = zdpPasskeyRegistrationPreferenceDefault;
    if (restoreFocus) void restoreEditorFocus(request, target);
  }
  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (locked || !editor || !permitted || !selectedExists || sameTask) return;
    touched = true;
    if (nameInvalid && editor !== 'revoke') return;
    if (editor !== 'rename' && settingsState.reauthentication === 'password' &&
        passwordInvalid) return;
    sameTask = true;
    queueMicrotask(() => { sameTask = false; });
    const currentPassword = settingsState.reauthentication === 'password' ? password : undefined;
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
    return dateFormatter.format(parsed);
  }
  function setName(value: string) {
    enteredName = value;
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
  let copy = $derived(messages);
  let preference = $derived(isZdpPasskeyRegistrationPreference(preferenceValue)
    ? preferenceValue : zdpPasskeyRegistrationPreferenceDefault);
  let suggestedName = $derived(editor === 'register'
    ? copy[defaultNameKeys[preference]] : '');
  let name = $derived(enteredName ?? suggestedName);
  let dateFormatter = $derived.by(() => {
    try { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }); }
    catch { return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }); }
  });
  let ready = $derived(settingsState.status === 'ready');
  $effect.pre(() => {
    if (settingsState.reauthentication !== 'password') password = '';
  });
  let currentFeedback = $derived(feedbackSequence === null || feedbackSequence === actionSequence ? feedback : null);
  let locked = $derived(busy || !ready || !onaction || currentFeedback === 'unconfirmed');
  $effect(() => { if (locked) menuId = null; });
  let permitted = $derived(editor !== null && settingsState.capabilities[editor]);
  let selectedExists = $derived(editor === 'register' || settingsState.passkeys.some(key => key.passkey_id === selectedId));
  let nameInvalid = $derived(editor !== 'revoke' && !validPasskeyLabel(name));
  let passwordInvalid = $derived(Array.from(password).length < 12 || Array.from(password).length > 128);
  $effect.pre(() => {
    if (submitted && currentFeedback !== submittedFeedback) feedbackChanged = true;
  });
  $effect.pre(() => {
    if (submitted && !busy && currentFeedback === 'saved' && editor &&
      (feedbackSequence !== null ? feedbackSequence === actionSequence : feedbackChanged)) close(false);
  });
  $effect.pre(() => {
    if (!busy && editor && (!ready || !permitted || !selectedExists)) close();
  });
  $effect.pre(() => {
    if (mounted && currentFeedback && !busy) {
      const expectedSequence = actionSequence;
      const expectedFeedback = currentFeedback;
      void tick().then(() => {
        if (!busy && expectedSequence === actionSequence && currentFeedback === expectedFeedback) feedbackElement?.focus();
      });
    }
  });
</script>

<Surface padding="lg">
  <section bind:this={settingsElement} class="zdp-passkey-settings" class:zdp-passkey-settings--directory={layout === 'directory'} aria-labelledby={`${idPrefix}-title`} aria-busy={busy} tabindex="-1">
    {#if heading}
      {@render heading({add: () => { void open('register'); }, disabled: locked || !settingsState.capabilities.register, titleId: `${idPrefix}-title`})}
    {:else}
    <header>
      <div><h2 id={`${idPrefix}-title`}>{copy.title}</h2><p>{copy.description}</p></div>
      {#if ready && settingsState.capabilities.register}
        <Button type="button" variant="secondary" disabled={locked} onclick={() => open('register')}>
          {copy.add}
        </Button>
      {/if}
    </header>
    {/if}
    {#if !ready}
      <p role="status">{settingsState.status === 'preparing' ? copy.preparing : copy.unavailable}</p>
    {:else}
      {#if settingsState.passkeys.length === 0}<p>{copy.empty}</p>{/if}
      <ul>
        {#each settingsState.passkeys as key (key.passkey_id)}
          <li>
            {#if layout === 'directory'}
              <div class="zdp-passkey-settings__directory-name">
                {#if itemIcon}<span class="zdp-passkey-settings__icon" aria-hidden="true">{@render itemIcon()}</span>{/if}
                <div><strong>{key.label}</strong><small>{key.authenticator ? providerLabel(key.authenticator) : copy.providerUnknown}</small></div>
              </div>
              <p class="zdp-passkey-settings__last-used" title={`${copy.created}: ${date(key.created_at)} · ${key.authenticator ? storageLabel(key.authenticator) : copy.storageUnknown}`}>
                {copy.lastUsed}: {key.last_used_at ? date(key.last_used_at) : copy.neverUsed}
              </p>
              <div class="zdp-passkey-settings__menu" inert={locked}>
                {#if settingsState.capabilities.rename || settingsState.capabilities.revoke}
                  <MenuWithTrigger triggerLabel={`${key.label} · ${copy.title}`} idPrefix={`${idPrefix}-${key.passkey_id}`} open={menuId === key.passkey_id}
                    onOpenChange={value => { menuId = value ? key.passkey_id : null; }}
                    items={[
                      ...(settingsState.capabilities.rename ? [{id:'rename',label:copy.rename,disabled:locked}] : []),
                      ...(settingsState.capabilities.revoke ? [{id:'revoke',label:copy.remove,disabled:locked,tone:'danger' as const}] : [])
                    ]}
                    onSelect={(event, item) => { if (item.id === 'rename' || item.id === 'revoke') void open(item.id, key.passkey_id, key.label, menuTrigger(event)); }}>
                    {#snippet trigger()}
                      <span>{#if actionIcon}{@render actionIcon()}{:else}{copy.title}{/if}</span>
                    {/snippet}
                  </MenuWithTrigger>
                {/if}
              </div>
            {:else}
            <div>
              <div class="zdp-passkey-settings__identity">
                <strong>{key.label}</strong>
                <Badge tone="neutral" size="sm">{key.authenticator ? providerLabel(key.authenticator) : copy.providerUnknown}</Badge>
              </div>
              <p>{copy.created}: {date(key.created_at)} · {copy.lastUsed}: {key.last_used_at ? date(key.last_used_at) : copy.neverUsed}</p>
              <p>{key.authenticator ? storageLabel(key.authenticator) : copy.storageUnknown}</p>
            </div>
            <div class="zdp-passkey-settings__actions">
              {#if settingsState.capabilities.rename}<Button type="button" variant="secondary" disabled={locked} onclick={() => open('rename', key.passkey_id, key.label)}>{copy.rename}</Button>{/if}
              {#if settingsState.capabilities.revoke}<Button type="button" variant="secondary" disabled={locked} onclick={() => open('revoke', key.passkey_id, key.label)}>{copy.remove}</Button>{/if}
            </div>
            {/if}
          </li>
        {/each}
      </ul>
      {#if editor}
        <div class="zdp-passkey-settings__editor" bind:this={editorElement}>
          <form method="post" onsubmit={submit}>
            <fieldset disabled={locked}>
              <legend tabindex="-1">{editor === 'register' ? copy.add : editor === 'rename' ? copy.rename : `${copy.remove}: ${name}`}</legend>
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
                  <Input id={`${idPrefix}-name`} name="label" bind:value={() => name, setName} required
                    invalid={touched && nameInvalid}
                    errorMessageId={touched && nameInvalid ? `${idPrefix}-name-error` : null}
                    describedBy={touched && nameInvalid ? `${idPrefix}-name-error` : null} />
                  {#if touched && nameInvalid}<p id={`${idPrefix}-name-error`} role="alert">{copy.invalidName}</p>{/if}
                </Field>
              {/if}
              {#if editor !== 'rename'}
                <p>{settingsState.reauthentication === 'passkey' ? copy.reauthPasskey : copy.reauthPassword}</p>
                {#if settingsState.reauthentication === 'password'}
                  <PasswordField id={`${idPrefix}-password`} name="current_password" {locale} messages={authMessages} bind:value={password}
                    label={copy.currentPassword} autocomplete="current-password" required disabled={locked}
                    errorText={touched && passwordInvalid ? copy.invalidPassword : null} />
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
  .zdp-passkey-settings--directory { gap:0; }
  .zdp-passkey-settings--directory li { display:grid; grid-template-columns:minmax(0,42%) minmax(0,1fr) auto; gap:1.5rem; min-block-size:5rem; padding-block:1rem; box-sizing:border-box; }
  .zdp-passkey-settings--directory li:last-child { border-bottom:var(--zdp-control-border-width) solid var(--zdp-color-line-subtle); }
  .zdp-passkey-settings--directory li > .zdp-passkey-settings__directory-name { display:flex; align-items:center; gap:1.25rem; }
  .zdp-passkey-settings__directory-name > div { display:grid; gap:0.25rem; min-inline-size:0; }
  .zdp-passkey-settings__directory-name strong { font-size:1rem; font-weight:500; overflow-wrap:anywhere; }
  .zdp-passkey-settings__directory-name small,.zdp-passkey-settings__last-used { font-size:0.875rem; color:var(--zdp-color-ink-muted); }
  .zdp-passkey-settings__icon { display:flex; flex:0 0 1.5rem; color:var(--zdp-color-ink-normal); }
  .zdp-passkey-settings__menu :global(.zdp-menu__trigger) { border-color:transparent; background:transparent; min-inline-size:2.75rem; min-block-size:2.75rem; padding:0.625rem; }
  .zdp-passkey-settings__menu :global(.zdp-menu__trigger-mark) { display:none; }
  @media (max-width:40rem) {
    .zdp-passkey-settings--directory li { grid-template-columns:minmax(0,1fr) auto; gap:0.5rem 1rem; }
    .zdp-passkey-settings__last-used { grid-column:1; padding-inline-start:2.75rem; }
    .zdp-passkey-settings__menu { grid-column:2; grid-row:1 / span 2; align-self:center; }
  }
  @media (max-width: 40rem) { li { align-items: flex-start; flex-direction: column; } li > .zdp-passkey-settings__actions { align-self: flex-end; } }
</style>
