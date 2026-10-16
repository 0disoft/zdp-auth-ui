import auth from '../src/lib/i18n/auth/en';
import settings from '../src/lib/i18n/passkey-settings/en';
import type { ZdpAuthMessages, ZdpPasskeySettingsMessages } from '../src/lib/i18n/schema';

const { productLink, ...missingSection } = auth;
// @ts-expect-error Every locale must provide its own complete product-link section.
const incompleteAuth: ZdpAuthMessages = missingSection;
const { lastUsed, ...missingKey } = settings;
// @ts-expect-error A missing passkey settings key must fail instead of shifting array positions.
const incompleteSettings: ZdpPasskeySettingsMessages = missingKey;
// @ts-expect-error A positional array is not a message catalog.
const positionalSettings: ZdpPasskeySettingsMessages = Object.values(settings);
// @ts-expect-error Misspelled keys cannot silently replace a schema key.
const misspelledSettings: ZdpPasskeySettingsMessages = { ...missingKey, lastUesd: lastUsed };
void [productLink, incompleteAuth, incompleteSettings, positionalSettings, misspelledSettings];
