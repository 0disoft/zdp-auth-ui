import auth from './auth/hi.js';
import settings from './passkey-settings/hi.js';
import { freezeMessages } from './freeze-messages.js';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.js';

export const locale = 'hi';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
