import auth from './auth/ko.js';
import settings from './passkey-settings/ko.js';
import { freezeMessages } from './freeze-messages.js';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.js';

export const locale = 'ko';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
