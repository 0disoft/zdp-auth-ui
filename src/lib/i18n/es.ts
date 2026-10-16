import auth from './auth/es.ts';
import settings from './passkey-settings/es.ts';
import { freezeMessages } from './freeze-messages.ts';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.ts';

export const locale = 'es';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
