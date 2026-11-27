import { ownerContactSlots, type OwnerContactSlot } from './owner-contacts';

export { ownerContactSlots, type OwnerContactSlot } from './owner-contacts';
export interface OwnerEnrollment {
  schema: 'doubloon.owner-enrollment/v1'; enabled: boolean;
  slots: { slot: OwnerContactSlot; status: 'not_set' | 'pending' | 'verified'; masked_contact: string | null;
    attempt_id: string | null; delivery_status: 'unknown' | 'accepted' | 'rejected' | null }[];
  passkey: { status: 'not_bound' | 'bound'; passkey_id: string | null };
  key_generation_authorized: false; signing_authorized: false; publication_authorized: false;
}
export type OwnerEnrollmentAction =
  | { action: 'request'; slot: OwnerContactSlot; contact: string; current_password: string; sms_opt_in?: true }
  | { action: 'confirm'; slot: OwnerContactSlot; attempt_id: string; code: string }
  | { action: 'bind'; passkey_id: string; current_password: string };
export type OwnerEnrollmentFeedback = 'saved' | 'failed' | 'unconfirmed' | 'rate_limited' | 'expired' | null;
export const ownerUuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/iu.test(v);
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).sort().join(',') === [...keys].sort().join(',');
// Masks are opaque provider text. Reject complete, recognizable unmasked contacts and control characters.
function mask(v: unknown): boolean {
  return v === null || typeof v === 'string' && v.length > 0 && v.length <= 254 && !/\p{C}/u.test(v) &&
    (v.match(/[*•…●]/gu)?.length ?? 0) >= 2 &&
    !/^\+?\d[\d ()-]{6,}\d$/u.test(v) && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(v) || /[*•…●]/u.test(v));
}
export function parseOwnerEnrollment(v: unknown): OwnerEnrollment | null {
  if (!record(v) || !exact(v, ['schema','enabled','slots','passkey','key_generation_authorized','signing_authorized','publication_authorized']) ||
      v.schema !== 'doubloon.owner-enrollment/v1' || typeof v.enabled !== 'boolean' ||
      v.key_generation_authorized !== false || v.signing_authorized !== false || v.publication_authorized !== false ||
      !Array.isArray(v.slots) || v.slots.length !== ownerContactSlots.length || !record(v.passkey) || !exact(v.passkey, ['status','passkey_id'])) return null;
  const seen = new Set<unknown>();
  for (const s of v.slots) {
    if (!record(s) || !exact(s, ['slot','status','masked_contact','attempt_id','delivery_status']) ||
        !ownerContactSlots.includes(s.slot as OwnerContactSlot) || seen.has(s.slot) ||
        !['not_set','pending','verified'].includes(String(s.status)) || !mask(s.masked_contact) ||
        !(s.attempt_id === null || ownerUuid(s.attempt_id)) ||
        !(s.delivery_status === null || ['unknown','accepted','rejected'].includes(String(s.delivery_status)))) return null;
    if (s.status === 'not_set' && (s.masked_contact !== null || s.attempt_id !== null || s.delivery_status !== null) ||
        s.status !== 'not_set' && (s.attempt_id === null || s.delivery_status === null)) return null;
    seen.add(s.slot);
  }
  if (v.passkey.status === 'not_bound' ? v.passkey.passkey_id !== null : v.passkey.status !== 'bound' || !ownerUuid(v.passkey.passkey_id)) return null;
  if (v.passkey.status === 'bound' && !v.slots.every(s => s.status === 'verified')) return null;
  return v as unknown as OwnerEnrollment;
}
export function ownerContactsReady(v: OwnerEnrollment | null | undefined): boolean {
  return !!v?.enabled && ownerContactSlots.every(slot => v.slots.some(s => s.slot === slot && s.status === 'verified'));
}
