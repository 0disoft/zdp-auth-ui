import auth from './auth/ko.ts';
import settings from './passkey-settings/ko.ts';
import { freezeMessages } from './freeze-messages.ts';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.ts';

export const locale = 'ko';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
