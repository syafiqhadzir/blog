---
layout: page
title: Accessibility
description: Accessibility statement for this blog, detailing our commitment to WCAG 2.2 conformance.
permalink: /accessibility
---
## Accessibility Statement

This website is committed to ensuring digital accessibility for everyone, including people with
disabilities. We aim to meet [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) conformance.

### Measures Taken

- **Semantic HTML**: All pages use proper heading hierarchy, landmarks, and ARIA attributes where needed.
- **Keyboard Navigation**: All interactive elements are accessible via keyboard.
- **Skip Links**: A "Skip to main content" link is provided on every page.
- **Colour Contrast**: Text meets the minimum 4.5:1 contrast ratio for normal text.
- **Reduced Motion**: Animations respect the `prefers-reduced-motion` setting.
- **Responsive Design**: Content reflows properly at 200% zoom.

### Known Limitations

- **User-Generated Content**: Blog post images may not always have descriptive alt text. We strive to improve this
  continuously.
- **Third-Party Content**: External embeds (if any) may not fully conform.

### Feedback

If you encounter accessibility issues on this site, please contact me:

- **Email**: [{{ site.email }}](mailto:{{ site.email }})
- **Twitter**: [@{{ site.author.twitter }}](<https://twitter.com/{{ site.author.twitter }}>)

We aim to respond within 5 business days.

### Conformance Status

This statement was last updated on {{ 'now' | date: '%Y-%m-%d' }}.

**Target Conformance**: WCAG 2.2 Level AA
