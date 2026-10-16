import auth from './auth/zh.ts';
import settings from './passkey-settings/zh.ts';
import { freezeMessages } from './freeze-messages.ts';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from './schema.ts';

export const locale = 'zh';
export const messages: ZdpAuthMessages = freezeMessages(auth);
export const passkeySettingsMessages: ZdpPasskeySettingsMessages = freezeMessages(settings);
export default messages;
