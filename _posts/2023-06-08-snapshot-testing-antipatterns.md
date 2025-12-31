---
layout: post
title: "Snapshot Testing Anti-Patterns: Stop Pressing 'u'"
date: 2023-06-08
category: QA
slug: snapshot-testing-antipatterns
gpgkey: "EBE8 BD81 6838 1BAF"
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Wall of Pink Text](#the-wall-of-pink-text)
- [The Lazy Muscle Memory](#the-lazy-muscle-memory)
- [Code Snippet: Dynamic Snapshots](#code-snippet-dynamic-snapshots)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Snapshot testing (popularised by Jest) is the "Get Rich Quick" scheme of software testing.

You write one line of code—`expect(component).toMatchSnapshot()`—and boom, you have "tested" a complex UI. You feel productive. You go to lunch early.

But like any get-rich-quick scheme, there is a catch. When the test fails (and it will, constantly), developers develop a dangerous reflex. They see a wall of pink text in the terminal, their eyes glaze over, and they press `u` to update the snapshot. They did not fix the bug; they just documented it.

## TL;DR

- **Size Matters**: If you cannot read the snapshot diff in 5 seconds, it is too big. Delete it.
- **Data over UI**: Snapshot the props or data structure, not the entire rendered DOM.
- **Matchers handle dynamics**: Use `expect.any(String)` for dynamic data like IDs and Dates so your tests do not flake.

## The Wall of Pink Text

The problem is not the snapshot; it is the **size** of the snapshot. If your snapshot is 2,000 lines of auto-generated HTML, nobody is going to read the diff during a Pull Request review.

When a snapshot fails, it should tell you a story:

- *"Hey, the button text changed from 'Save' to 'Submit'."* (Good)
- *"Hey, 500 lines of div soup got rearranged because you added a CSS class wrapper."* (Bad)

## The Lazy Muscle Memory

The most common reason snapshots fail is **non-deterministic data**.

- "Created at: 2023-06-09T12:00:00Z" vs "2023-06-09T12:01:00Z"
- "ID: 12345" vs "ID: 67890"

If you are snapshotting a full object, these random values will break your build every single time. The lazy fix is to press `u` (Update) without looking. The pro fix is to use **Property Matchers**.

## Code Snippet: Dynamic Snapshots

Instead of hardcoding mocks, tell Jest to expect *any* string for the ID, but a specific value for the name.

```javascript
test('user profile matches snapshot', () => {
    const user = {
        id: '507f1f77bcf86cd799439011', 
        name: 'John Doe',
        createdAt: new Date(),
        role: 'ADMIN'
    };

    // The Magic: Asymmetric Matchers
    // We confirm the STRUCTURE, without sweating the VALUES of dynamic fields
    expect(user).toMatchSnapshot({
        id: expect.any(String),
        createdAt: expect.any(Date)
    });
});
```

**The Resulting Snapshot:**

```javascript
Object {
  "createdAt": Any<Date>,
  "id": Any<String>,
  "name": "John Doe",
  "role": "ADMIN",
}
```

Now, the snapshot is stable. It verifies the *structure* of the dynamic fields and the *value* of the static fields.

## Summary

Snapshot testing is a double-edged sword. Used correctly on small, focused components (like a Redux reducer output or a single Button component), it is incredible.

Used lazily on entire Page containers, it creates a "Write Once, Read Never" artefact that pollutes your git history and gives you false confidence.

## Key Takeaways

- **Small is Beautiful**: If your snapshot file is larger than the test file, delete it.
- **Intentionality matters**: Do not snapshot everything. Snapshot the things where a visual change *should* be flagged (e.g., error messages, legal disclaimers).
- **Discipline is required**: Never press `u` without reading the diff. If you catch yourself doing it, delete the test. It is providing negative value.

## Next Steps

- **Audit**: Run a search for `.snap` files > 50KB in your repo. Delete them.
- **Refactor**: Replace full component snapshots with `data-testid` assertions for critical elements.
- **Config**: Configure Jest to ignore class names in snapshots if using CSS-Modules (they generate random hashes).
