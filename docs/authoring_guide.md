# Accessibility Authoring Guide

To maintain WCAG 2.2 AA compliance, follow these guidelines when writing new
blog posts.

## Images

- Always provide descriptive `alt` text for informative images.
- Use empty `alt=""` or `aria-hidden="true"` for purely decorative images.
- Avoid "Image of..." or "Picture of..."; just describe the content.

## Headings

- Use `#` for the post title (Level 1) - _Jekyll handles this automatically_.
- Use `##` for main sections (Level 2).
- Use `###` for subsections (Level 3).
- **Do not skip levels** (e.g., jumping from `##` to `####`).

## Links

- Use descriptive link text.
  - ❌ "Click here"
  - ✅ "Read the documentation"
- Links should make sense out of context.

## Design

- Avoid using color as the only means of conveying information.
- Ensure any custom HTML has sufficient contrast (check with DevTools).

## Code Blocks

- Use standard markdown fences. The syntax highlighting theme handles contrast
  automatically.
