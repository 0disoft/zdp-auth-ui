import auth from './auth/ru.ts';
import settings from './passkey-settings/ru.ts';
import { freezeMessages } from './freeze-messages.ts';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.ts';

export const locale = 'ru';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
