const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const COLOR_UTILITIES =
  'bg|text|border(?:-[xytrbl])?|ring|inset-ring|outline|fill|stroke|from|via|to|decoration|divide|placeholder|shadow|inset-shadow|accent|caret';
const SPACING_UTILITIES =
  '-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left)';

const paletteColor = new RegExp(`^(?:${COLOR_UTILITIES})-(?:${PALETTE})-\\d{2,3}(?:\\/[\\w.\\[\\]%]+)?$`);
const arbitraryColor = new RegExp(`^(?:${COLOR_UTILITIES})-\\[(?:#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\(|color\\()`);
const arbitrarySpacing = new RegExp(`^${SPACING_UTILITIES}-\\[\\d[\\w.%]*\\]$`);
const arbitraryRadius = /^rounded(?:-[a-z]{1,2})?-\[\d[\w.%]*\]$/;

const CLASS_FUNCTIONS = new Set(['cn', 'clsx', 'cva', 'cx', 'twMerge']);
const CLASS_ATTRIBUTES = new Set(['className', 'class']);

function utilityOf(className) {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < className.length; index++) {
    const char = className[index];
    if (char === '[' || char === '(') depth++;
    else if (char === ']' || char === ')') depth--;
    else if (char === ':' && depth === 0) start = index + 1;
  }
  return className.slice(start).replace(/^!/, '').replace(/!$/, '');
}

function variantsOf(className) {
  const utility = utilityOf(className);
  return className.slice(0, className.length - utility.length);
}

function isClassContext(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'JSXAttribute') return CLASS_ATTRIBUTES.has(parent.name?.name);
    if (parent.type === 'CallExpression') {
      const callee = parent.callee;
      const name = callee.type === 'Identifier' ? callee.name : callee.property?.name;
      if (CLASS_FUNCTIONS.has(name)) return true;
    }
    if (parent.type === 'Program') return false;
  }
  return false;
}

function classStrings(context, test, message) {
  const check = (node, text) => {
    if (!isClassContext(node)) return;
    for (const className of text.split(/\s+/)) {
      if (className === '') continue;
      if (test(className)) context.report({ node, message: message(className) });
    }
  };
  return {
    Literal(node) {
      if (typeof node.value === 'string') check(node, node.value);
    },
    TemplateElement(node) {
      check(node, node.value.cooked ?? node.value.raw);
    },
  };
}

const noRawColor = {
  meta: {
    type: 'problem',
    docs: { description: 'Colors come from the intent tokens, not the Tailwind palette or a literal color.' },
  },
  create: (context) =>
    classStrings(
      context,
      (className) => paletteColor.test(utilityOf(className)) || arbitraryColor.test(utilityOf(className)),
      (className) =>
        `\`${className}\` is a raw color. Use a token: \`text-muted-foreground\`, \`bg-primary-subtle\`, \`border-border\`, an \`intent\` (DESIGN.md, Color).`,
    ),
};

const noDarkVariant = {
  meta: {
    type: 'problem',
    docs: { description: 'Tokens already change with the color mode; `dark:` forks the design.' },
  },
  create: (context) =>
    classStrings(
      context,
      (className) => /(^|:)dark:/.test(variantsOf(className)),
      (className) =>
        `\`${className}\`: the tokens already change with the color mode. Use one token for both (DESIGN.md, Color).`,
    ),
};

const noArbitrarySize = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Spacing and radius come from the named roles, not arbitrary lengths.' },
  },
  create: (context) =>
    classStrings(
      context,
      (className) => arbitrarySpacing.test(utilityOf(className)) || arbitraryRadius.test(utilityOf(className)),
      (className) =>
        `\`${className}\` is an off-scale length. Use a role: \`gap-related\`, \`p-card\`, \`rounded-control\` (DESIGN.md, Spacing and Shape).`,
    ),
};

/** Every string and template piece under a node: a className is a literal, a template or `cn(…)` arguments. */
function classTexts(node, found = []) {
  if (!node || typeof node !== 'object') return found;
  if (node.type === 'Literal' && typeof node.value === 'string') found.push([node, node.value]);
  else if (node.type === 'TemplateElement') found.push([node, node.value.cooked ?? node.value.raw]);
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const child = node[key];
    if (Array.isArray(child)) for (const item of child) classTexts(item, found);
    else if (child && typeof child === 'object' && typeof child.type === 'string') classTexts(child, found);
  }
  return found;
}

const INNER_UTILITY =
  /^(?:flex|grid|block|inline|contents|hidden|border|rounded|shadow|(?:inline|overflow|grid|flex|gap|items|justify|p|px|py|pt|pr|pb|pl|ps|pe|rounded|bg|border|shadow)-.+)$/;
const BREAKPOINT_VARIANT = /(?:^|:)(?:max-)?(?:sm|md|lg|xl|2xl|@[\w-]+):/;

const noInnerClasses = {
  meta: {
    type: 'suggestion',
    docs: { description: 'A consumer places and sizes a part; it never changes the part inside.' },
  },
  create: (context) => {
    const partNames = new Set();
    return {
      ImportDeclaration(node) {
        if (!node.source.value.startsWith('~/components/ui/')) return;
        for (const specifier of node.specifiers) partNames.add(specifier.local.name);
      },
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || !partNames.has(node.name.name)) return;
        for (const attribute of node.attributes) {
          if (attribute.type !== 'JSXAttribute' || !CLASS_ATTRIBUTES.has(attribute.name?.name)) continue;
          for (const [textNode, text] of classTexts(attribute.value)) {
            for (const className of text.split(/\s+/)) {
              const utility = utilityOf(className);
              const isResponsiveHidden = utility === 'hidden' && BREAKPOINT_VARIANT.test(className);
              if (!INNER_UTILITY.test(utility) || isResponsiveHidden) continue;
              context.report({
                node: textNode,
                message: `\`${className}\` on \`${node.name.name}\`: a part lays out its inside itself; a consumer only places and sizes it (DESIGN.md, Composition).`,
              });
            }
          }
        }
      },
    };
  },
};

export default {
  meta: { name: 'pavo' },
  rules: {
    'no-raw-color': noRawColor,
    'no-dark-variant': noDarkVariant,
    'no-arbitrary-size': noArbitrarySize,
    'no-inner-classes': noInnerClasses,
  },
};
