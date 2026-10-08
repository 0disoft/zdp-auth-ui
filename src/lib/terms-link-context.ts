import type { Readable } from 'svelte/store';

export const termsLinkContextKey = Symbol('zdp-auth-ui-terms-link');

export type TermsLinkContext = Readable<string | null>;
