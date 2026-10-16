import auth from './auth/ru.js';
import settings from './passkey-settings/ru.js';
import { freezeMessages } from './freeze-messages.js';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.js';

export const locale = 'ru';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
