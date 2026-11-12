import { expect, test } from 'bun:test';
import { ownerContactsReady, ownerContactSlots, parseOwnerEnrollment } from '../src/lib/owner-enrollment';
const id = '11111111-1111-4111-8111-111111111111';
const state = () => ({ schema: 'doubloon.owner-enrollment/v1', enabled: true,
  slots: ownerContactSlots.map(slot => ({slot, status:'verified', masked_contact: slot.startsWith('email') ? 'f***@example.test' : '+82***1234', attempt_id:id, delivery_status:'accepted'})),
  passkey:{status:'not_bound', passkey_id:null}, key_generation_authorized:false, signing_authorized:false, publication_authorized:false });
test('only all four unique verified slots prepare a passkey; authority remains server-owned', () => {
  expect(ownerContactsReady(parseOwnerEnrollment(state()))).toBe(true);
  const partial = state(); partial.slots[3].status = 'pending';
  expect(ownerContactsReady(parseOwnerEnrollment(partial))).toBe(false);
  partial.slots[3].slot = 'phone_a'; expect(parseOwnerEnrollment(partial)).toBeNull();
  expect(parseOwnerEnrollment({...state(), signing_authorized:true})).toBeNull();
});
test('reject raw contacts, extra fields and malformed projections', () => {
  for (const raw of ['fixture@example.test', '+821012345678']) {
    const value = state(); value.slots[0].masked_contact = raw;
    expect(parseOwnerEnrollment(value)).toBeNull();
  }
  expect(parseOwnerEnrollment({...state(), contact:'fixture@example.test'})).toBeNull();
  const bad = state(); bad.slots[0].delivery_status='raw provider error'; expect(parseOwnerEnrollment(bad)).toBeNull();
});
