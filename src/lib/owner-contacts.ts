export const ownerContactSlots = Object.freeze(['email_a', 'email_b', 'phone_a', 'phone_b'] as const);
export type OwnerContactSlot = typeof ownerContactSlots[number];

export const ownerAccessNotificationPolicies = Object.freeze(['all-contacts-v1', 'email-pair-v1'] as const);
export type OwnerAccessNotificationPolicy = typeof ownerAccessNotificationPolicies[number];

const notificationSlots: Readonly<Record<OwnerAccessNotificationPolicy, readonly OwnerContactSlot[]>> = {
  'all-contacts-v1': ownerContactSlots,
  'email-pair-v1': Object.freeze(['email_a', 'email_b'])
};

export function getOwnerAccessNotificationSlots(
  policy: OwnerAccessNotificationPolicy = 'email-pair-v1'
): readonly OwnerContactSlot[] {
  return Object.hasOwn(notificationSlots, policy) ? notificationSlots[policy] : notificationSlots['email-pair-v1'];
}
