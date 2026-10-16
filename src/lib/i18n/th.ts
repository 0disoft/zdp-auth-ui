import auth from './auth/th.js';
import settings from './passkey-settings/th.js';
import { freezeMessages } from './freeze-messages.js';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.js';

export const locale = 'th';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
