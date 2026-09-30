import type { ZdpAuthMessages as PublicMessages } from 'zdp-auth-ui/i18n';
import type { ZdpAuthMessages as SourceMessages } from '../src/lib/i18n';

type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

export type MessageDeclarationParity = Assert<Same<PublicMessages, SourceMessages>>;
