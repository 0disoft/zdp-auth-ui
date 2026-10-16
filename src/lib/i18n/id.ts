import auth from './auth/id.js';
import settings from './passkey-settings/id.js';
import { freezeMessages } from './freeze-messages.js';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.js';

export const locale = 'id';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
