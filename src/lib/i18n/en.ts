import auth from './auth/en.ts';
import settings from './passkey-settings/en.ts';
import { freezeMessages } from './freeze-messages.ts';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.ts';

export const locale = 'en';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
