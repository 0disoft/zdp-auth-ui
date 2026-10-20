import assert from 'node:assert/strict';

export async function checkProductLinkFocusLifecycle(page) {
  for (const shadow of [false, true]) {
    await page.evaluate(shadow => {
      globalThis.__linkFocus = globalThis.mountProductLinkFocusFixture(shadow);
    }, shadow);
    const fixture = page.getByTestId('product-link-focus-fixture').last();
    const approve = fixture.getByRole('button', { name: 'Approve connection', exact: true });
    const outside = fixture.getByTestId('link-focus-outside');
    const focused = locator => locator.evaluate(element => element.getRootNode().activeElement === element);
    const transition = async next => {
      await page.evaluate(next => globalThis.__linkFocus.transition(next), next);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    };

    await approve.focus(); await transition('replace');
    assert.equal(await focused(approve), true, 'An old result must not focus the status of a replacement request.');
    await approve.focus(); await transition('outside');
    assert.equal(await focused(outside), true, 'A pending result focus must respect a newer outside focus move.');
    await page.evaluate(() => globalThis.__linkFocus.reset());
    await approve.focus(); await transition('settle');
    assert.equal(await focused(fixture.locator('.zdp-product-link__status')), true,
      'The current request still focuses its own completed result.');
    await page.evaluate(() => globalThis.__linkFocus.reset());
    await approve.focus(); await transition('remove');
    assert.equal(await fixture.locator('.zdp-product-link').count(), 0);
    assert.equal(await focused(outside), true, 'Removing the component cancels its pending result focus.');
  }
}
