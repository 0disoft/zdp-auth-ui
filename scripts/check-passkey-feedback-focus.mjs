import assert from 'node:assert/strict';

export async function checkPasskeyFeedbackFocus(fixture) {
  const editor = fixture.locator('.zdp-passkey-settings__editor');
  const add = fixture.locator('header button');
  const name = editor.locator('#feedback-settings-name');
  const submit = editor.locator('button[type="submit"]');
  const cancel = editor.getByRole('button', { name: 'Cancel', exact: true });
  const saved = fixture.getByText('Saved.', { exact: true });
  const failed = fixture.getByText('We could not make this change. Try again.', { exact: true });

  await add.click(); await submit.click();
  assert.equal(await fixture.getByTestId('feedback-sequence').textContent(), '1');
  await cancel.click(); await add.click(); await name.fill('New editor name');
  await fixture.getByTestId('deliver-saved').evaluate(button => button.click());
  await saved.waitFor();
  assert.equal(await name.evaluate(input => input.getRootNode().activeElement === input), true,
    'A response to a cancelled submission must not steal focus from its replacement editor.');
  assert.equal(await name.inputValue(), 'New editor name');

  await submit.click();
  assert.equal(await fixture.getByTestId('feedback-sequence').textContent(), '2');
  await fixture.getByTestId('deliver-saved').evaluate(button => button.click());
  await editor.waitFor({ state: 'detached' }); await saved.waitFor();
  assert.equal(await saved.evaluate(status => status.getRootNode().activeElement === status), true,
    'The current successful submission still closes the editor and focuses its result.');

  const outside = fixture.getByTestId('clear-feedback');
  await outside.click();
  await fixture.getByTestId('deliver-failed').evaluate(button => button.click());
  await failed.waitFor();
  assert.equal(await outside.evaluate(button => button.getRootNode().activeElement === button), true,
    'Feedback without an outstanding focus request must not move focus.');

  await add.click(); await submit.click();
  assert.equal(await fixture.getByTestId('feedback-sequence').textContent(), '3');
  await fixture.getByTestId('deliver-failed').evaluate(button => button.click());
  await failed.waitFor();
  assert.equal(await editor.count(), 1, 'Failed submissions retain their editor.');
  assert.equal(await failed.evaluate(status => status.getRootNode().activeElement === status), true,
    'The current failed submission still focuses its actionable error.');
  await name.focus(); await outside.evaluate(button => button.click());
  await fixture.getByTestId('deliver-failed').evaluate(button => button.click());
  await failed.waitFor();
  assert.equal(await name.evaluate(input => input.getRootNode().activeElement === input), true,
    'Replayed feedback must not interrupt correction after the result was already focused.');
}
