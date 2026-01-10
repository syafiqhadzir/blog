# Modern Linting Standards - Industrial Grade

**Last Updated**: 2026-01-10  
**Philosophy**: Enhanced modern standards with industrial balance  
**Status**: ✅ PRODUCTION-READY

---

## 🎯 Philosophy

These linting rules enforce **modern bleeding-edge syntax** while maintaining **practical balance** for real-world production codebases. They are:

- ✅ **Strict on deprecations**: No legacy syntax allowed
- ✅ **Modern patterns enforced**: ES2023+, Ruby 3.4+, CSS3+
- ✅ **Pragmatic limits**: Balanced complexity for maintainability
- ✅ **Industrial standard**: Used in enterprise production code

---

## 🔥 ESLint (JavaScript/TypeScript)

### Modern Syntax Enforcement

**DEPRECATED SYNTAX - BANNED**:

- ❌ `var` → Use `const`/`let`
- ❌ `function()` callbacks → Use arrow functions
- ❌ String concatenation → Use template literals
- ❌ `arguments` → Use rest parameters
- ❌ `.apply()` → Use spread operator
- ❌ `Object.assign()` → Use object spread

**REQUIRED MODERN PATTERNS**:

- ✅ `const`/`let` declarations
- ✅ Arrow functions for callbacks
- ✅ Template literals for strings
- ✅ Destructuring assignments
- ✅ Object/array spread operators
- ✅ Modern number literals
- ✅ Async/await over promises

### Complexity Limits (Industrial Balanced)

```javascript
complexity: 10              // Cyclomatic complexity
max-depth: 3                // Nesting depth
max-lines: 250              // File length
max-lines-per-function: 75  // Function length
max-nested-callbacks: 3     // Callback depth
max-params: 4               // Function parameters
max-statements: 25          // Statements per function
```

### TypeScript Type Safety

**ALL STRICT FLAGS ENABLED**:

- ✅ `strict: true`
- ✅ `strictNullChecks`
- ✅ `noImplicitAny`
- ✅ `strictFunctionTypes`
- ✅ `strictBindCallApply`
- ✅ `noUncheckedIndexedAccess`

**Modern Type Patterns**:

- ✅ Nullish coalescing (`??`)
- ✅ Optional chaining (`?.`)
- ✅ Const assertions
- ✅ Type imports/exports
- ✅ Readonly parameters (where needed)

### Code Quality

- **SonarJS**: Cognitive complexity limit of 12
- **Unicorn**: Modern JavaScript patterns enforced
- **Perfectionist**: Natural sorting of imports/exports
- **No console**: Warnings (allowed for debugging)

---

## 🎨 Stylelint (CSS/SCSS)

### Modern CSS Enforcement

**DEPRECATED SYNTAX - BANNED**:

- ❌ `rgb()`, `rgba()` → Use modern `color()` or `hsl()`
- ❌ Print units (`cm`, `mm`, `in`, `pt`) → Screen units only
- ❌ Vendor prefixes → Use autoprefixer

**REQUIRED MODERN PATTERNS**:

- ✅ Modern color functions (`color()`, `oklch()`, `hsl()`)
- ✅ Logical properties where appropriate
- ✅ Custom properties (CSS variables)
- ✅ Modern angle notation
- ✅ Percentage alpha values

### Complexity Limits (Industrial Balanced)

```scss
max-nesting-depth: 3              // SCSS nesting
selector-max-class: 4             // BEM-friendly
selector-max-combinators: 3       // Combinator chains
selector-max-compound-selectors: 4 // Compound selectors
selector-max-specificity: '0,4,1' // Balanced specificity
```

### Strict Value Enforcement

**Variables required for**:

- Colors (all color values)
- Z-index values

**Why limited scope?**: Font sizes and spacing can use calculations, making strict enforcement impractical.

---

## 💎 RuboCop (Ruby)

### Modern Ruby Enforcement

**DEPRECATED SYNTAX - BANNED**:

- ❌ Hash rockets for symbols → New hash syntax
- ❌ `and`/`or` → Use `&&`/`||`
- ❌ Explicit returns → Implicit returns
- ❌ Old lambda syntax → Modern `->` syntax

**REQUIRED MODERN PATTERNS**:

- ✅ Ruby 3.4+ syntax
- ✅ Frozen string literals
- ✅ Modern hash syntax
- ✅ Safe navigation (`&.`)
- ✅ Symbol/word arrays (`%i[]`, `%w[]`)
- ✅ Shorthand hash syntax

### Metrics (Industrial Balanced)

```ruby
MethodLength: 15        # Practical methods
ClassLength: 120        # Reasonable classes
LineLength: 120         # Modern screens
AbcSize: 15             # Assignment/Branch/Condition
CyclomaticComplexity: 8 # Branching complexity
PerceivedComplexity: 10 # Human perception
```

### Performance

**ALL Performance cops enabled**:

- ✅ `Performance::Casecmp`
- ✅ `Performance::Count`
- ✅ `Performance::Detect`
- ✅ `Performance::RangeInclude`
- ✅ All others enabled

---

## 📘 TypeScript Compiler

### Modern Compiler Options

**Target**: ES2023 (latest stable)  
**Module**: ESNext  
**Lib**: ES2023 + DOM

### All Strict Flags Enabled

```json
{
  "strict": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "useUnknownInCatchVariables": true,
  "alwaysStrict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "allowUnusedLabels": false,
  "allowUnreachableCode": false,
  "exactOptionalPropertyTypes": true
}
```

---

## 🚀 Running Linters

```bash
# Individual linters
npm run lint:ts      # ESLint + TypeScript
npm run lint:css     # Stylelint
npm run lint:md      # Markdownlint
bundle exec rubocop  # RuboCop

# All at once
npm run lint

# Auto-fix where possible
npm run lint:ts -- --fix
npm run lint:css -- --fix
bundle exec rubocop -a
```

---

## 📊 Comparison: Before vs After

| Metric | Too Strict | **Balanced (Current)** | Too Relaxed |
|--------|------------|----------------------|-------------|
| **Complexity** | 6 | **10** | 20 |
| **Max Lines** | 150 | **250** | 500 |
| **Function Length** | 50 | **75** | 150 |
| **Nesting Depth** | 2 | **3** | 5 |
| **Method Length (Ruby)** | 8 | **15** | 30 |
| **Specificity** | 0,2,1 | **0,4,1** | 0,8,3 |

---

## ✅ What's Enforced

### Absolutely Required (Errors)

1. ✅ No deprecated syntax
2. ✅ Modern patterns only
3. ✅ Type safety (TypeScript)
4. ✅ No duplicate code
5. ✅ Performance optimizations
6. ✅ Standard naming conventions
7. ✅ Proper error handling

### Recommended (Warnings)

1. ⚠️ Console statements (debugging allowed)
2. ⚠️ Skipped tests (temporary)
3. ⚠️ Some type annotations
4. ⚠️ Ternary complexity

### Relaxed

1. ℹ️ Comment formatting
2. ℹ️ File organization
3. ℹ️ Inline disables (with explanation)

---

## 🎓 Modern Syntax Examples

### JavaScript/TypeScript

**❌ Deprecated**:

```javascript
var name = 'John';  // Use const/let
function callback() {}  // Use arrow function
str1 + ' ' + str2;  // Use template literal
fn.apply(null, args);  // Use spread
```

**✅ Modern**:

```javascript
const name = 'John';
const callback = () => {};
`${str1} ${str2}`;
fn(...args);
```

### CSS/SCSS

**❌ Deprecated**:

```css
color: rgb(255, 0, 0);  /* Use modern color */
margin: 0.33333333rem;  /* Too much precision */
```

**✅ Modern**:

```css
color: var(--color-primary);
margin: 0.333rem;
```

### Ruby

**❌ Deprecated**:

```ruby
{ :name => 'John' }  # Old hash syntax
value and other_value  # Use &&
```

**✅ Modern**:

```ruby
{ name: 'John' }  # Modern syntax
value && other_value
user&.name  # Safe navigation
```

---

## 🔧 Configuration Files

- **ESLint**: `eslint.config.js` (flat config)
- **Stylelint**: `stylelint.config.js`
- **RuboCop**: `.rubocop.yml`
- **TypeScript**: `tsconfig.json`
- **Prettier**: `.prettierrc`
- **Markdownlint**: `.markdownlint.json`

---

## 📈 Benefits

1. **Modern Codebase**: Latest syntax and patterns
2. **Maintainability**: Balanced complexity limits
3. **Type Safety**: Maximum TypeScript strictness
4. **Performance**: Optimized patterns enforced
5. **Consistency**: Automated code style
6. **Quality**: Industrial-grade standards
7. **Future-Proof**: Ready for new standards

---

## 🎯 Migration Guide

### For Existing Code

1. Run linters to see violations
2. Auto-fix where possible (`--fix`)
3. Update deprecated syntax first
4. Refactor complex functions
5. Add type annotations gradually
6. Document intentional exceptions

### Escaping Rules

Use sparingly and document:

```javascript
// eslint-disable-next-line max-lines-per-function -- Complex business logic
function processOrder() { ... }
```

```ruby
# rubocop:disable Metrics/AbcSize -- Algorithm complexity intrinsic
def complex_algorithm
end
```

---

## 📚 References

- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [TypeScript ESLint](https://typescript-eslint.io/rules/)
- [Stylelint Rules](https://stylelint.io/user-guide/rules/)
- [RuboCop Docs](https://docs.rubocop.org/rubocop/)
- [Modern JavaScript](https://javascript.info/)
- [Modern CSS](https://web.dev/learn/css/)

---

**Philosophy**: Enforce modern standards strictly, but with pragmatic limits that work for real production code. No deprecated syntax, but reasonable complexity for maintainability.

**Review**: Quarterly
**Last Audit**: 2026-01-10
