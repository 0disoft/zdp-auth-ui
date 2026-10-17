import { parse, type AST } from 'svelte/compiler';

const tokenProperties = /^(?:font-(?:size|weight)|line-height|letter-spacing|(?:padding|margin)(?:-[a-z-]+)?|(?:(?:row|column)-)?gap|(?:(?:min|max)-)?(?:width|height|inline-size|block-size)|flex(?:-basis)?)$/;
const relativeSizeProperties = /^(?:(?:min|max)-)?(?:width|height|inline-size|block-size)$|^flex(?:-basis)?$/;

export interface StyleTokenViolation {
  readonly property: string;
  readonly value: string;
  readonly line: number;
}

export function findStyleTokenViolations(source: string): StyleTokenViolation[] {
  const stylesheet = parse(source, { modern: true }).css;
  const violations: StyleTokenViolation[] = [];
  if (!stylesheet) return violations;

  function visit(nodes: AST.CSS.Block['children']): void {
    for (const node of nodes) {
      if (node.type !== 'Declaration') {
        if (node.block) visit(node.block.children);
        continue;
      }
      const property = node.property.toLowerCase();
      if (!tokenProperties.test(property)) continue;
      // Keep var() fallbacks visible while ignoring digits in token names.
      const value = node.value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[\w-]+/g, '');
      const numbers = value.matchAll(/(?<![\w-])([-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?)([a-z]+|%)?/gi);
      for (const [, number, unit] of numbers) {
        if (Number(number) === 0) continue;
        // A single-line box is a structural reset (for example, compact badges).
        if (property === 'line-height' && !unit && Number(number) === 1) continue;
        // Proportional sizing and unitless calc() multipliers aren't spacing tokens.
        if (unit === '%' && relativeSizeProperties.test(property)) continue;
        if (!unit && property !== 'font-weight' && property !== 'line-height') continue;
        violations.push({
          property: node.property,
          value: node.value,
          line: source.slice(0, node.start).split('\n').length
        });
        break;
      }
    }
  }

  visit(stylesheet.children);
  return violations;
}
