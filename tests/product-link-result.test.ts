import { expect, test } from 'bun:test';
import { validateProductLinkRequest, type ZdpProductLinkRequest, type ZdpProductLinkTrustPolicy } from '../src/lib/product-link';

test('invalid product link results do not share mutable validation state', () => {
  const request = null as unknown as ZdpProductLinkRequest;
  const trust = null as unknown as ZdpProductLinkTrustPolicy;
  const first = validateProductLinkRequest(request, trust);
  Object.assign(first, { disposition: 'ready', actionable: true });
  const second = validateProductLinkRequest(request, trust);
  expect(second).toEqual({ disposition: 'invalid', actionable: false });
  expect(second).not.toBe(first);
});
