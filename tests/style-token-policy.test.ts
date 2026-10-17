import { expect, test } from 'bun:test';
import { findStyleTokenViolations } from '../scripts/style-token-policy';

test.each([
  ['gap', '1.5rem'], ['column-gap', 'var(--zdp-space-2) 12px'],
  ['padding-inline', '0 1rem'], ['margin-block-start', '-.25rem'],
  ['font-size', '87.5%'], ['font-weight', '500'], ['line-height', '1.5'],
  ['min-block-size', '5rem'], ['height', '1.125rem'], ['flex', '0 0 1.5rem'],
  ['padding', 'var(--zdp-space-2, 8px)'], ['gap', 'calc(var(--zdp-space-2) + 1px)']
])('rejects raw %s: %s, including nested rules and fallbacks', (property, value) => {
  const source = `<div />\n<style>\n@media (max-width: 40rem) { .fixture { ${property}: ${value}; } }\n</style>`;
  expect(findStyleTokenViolations(source)).toEqual([{ property, value, line: 3 }]);
});

test('allows token calculations, zero resets, relative layout, comments and keywords', () => {
  expect(findStyleTokenViolations(`<div />
    <style>
      /* gap: 1rem; font-weight: 500; */
      .fixture {
        gap: var(--zdp-space-2) var(--zdp-space-4);
        padding: calc((var(--zdp-control-icon-md) - var(--zdp-space-6)) / 2);
        min-block-size: calc(var(--zdp-space-10) * 2);
        font-size: var(--zdp-type-caption-size);
        font-weight: var(--zdp-font-weight-medium);
        line-height: var(--zdp-type-body-line-height);
        margin: 0 auto; padding-inline: 0px; width: 100%; flex: 1 0 42%;
      }
      @media (max-width: 40rem) { .fixture { gap: 0; } }
      .fixture small { line-height: 1; }
    </style>`)).toEqual([]);
});

test('ignores script strings, inline SVG coordinates and components without styles', () => {
  expect(findStyleTokenViolations(`<script>const example = 'font-weight: 500; padding: 1rem;';</script>
    <svg viewBox="0 0 24 24"><path stroke-width="2" d="M4 4l16 16" /></svg>`)).toEqual([]);
});
