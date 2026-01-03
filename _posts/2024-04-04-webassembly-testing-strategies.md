---
layout: post
title: "WebAssembly Testing Strategies: When JavaScript Just Isn't Fast Enough"
date: 2024-04-04
category: QA
slug: webassembly-testing-strategies
gpgkey: EBE8 BD81 6838 1BAF
tags: ['emerging-tech', 'real-time', 'automation']
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Black Box" Problem](#the-black-box-problem)
- [Memory Leaks (The Rust Edition)](#memory-leaks-the-rust-edition)
- [Code Snippet: Testing WASM with Rust](#code-snippet-testing-wasm-with-rust)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

JavaScript is great. It runs everywhere, it is flexible, and it is slow.

WebAssembly (WASM) is the answer for when you want to run Photoshop in a browser
tab. It lets you write code in Rust, C++, or Go and run it on the web at
near-native speed.

But how do you test a binary blob that you cannot even read? Welcome to the
thunderdome of low-level web debugging.

## TL;DR

- **Unit Tests run in source language**: Run them in the source language
  (Rust/C++) before compiling.
- **Integration tests verify glue code**: Test the JavaScript "Glue Code" that
  passes data in and out.
- **Performance must be measured**: Use `performance.measure` to verify that
  WASM is actually faster than JS (sometimes it is not due to overhead).

## The "Black Box" Problem

Once compiled, WASM is just numbers. You cannot stick a `console.log` inside a
binary easily.

**QA Strategy**: Treat it like an API. Input: Array Buffer. Output: Array
Buffer. If the output is wrong, blame the Rust developer.

## Memory Leaks (The Rust Edition)

In JS, the Garbage Collector cleans up your mess. In WASM (depending on the
language), you might have to manage memory manually.

If your WASM module chews up 2GB of RAM and crashes the tab, that is a P0 bug.

**QA Test**: Run the WASM function 10,000 times in a loop and watch the Chrome
Task Manager.

## Code Snippet: Testing WASM with Rust

If you write WASM in Rust (the most popular choice), you use `wasm-bindgen-test`
to run tests in a headless browser.

```rust
// lib.rs
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::*;

// Configure test to run in a browser (headless)
wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen_test]
fn test_add() {
    // This runs inside a headless browser via `wasm-pack test`
    assert_eq!(add(1, 1), 2);
}

#[wasm_bindgen_test]
fn test_dom_interaction() {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");

    // verify we can access the DOM from Rust
    assert!(document.body().is_some());
}
```

## Summary

WASM is powerful, but it adds complexity. You now have a build pipeline that
involves compilers, linkers, and glue code.

QA must ensure that this complexity buys us performance, not just "CV-driven
development".

## Key Takeaways

- **Glue Code is the weak point**: The biggest bugs are usually in the data
  conversion (e.g., passing a String from JS to Rust requires utf-8
  encoding/decoding).
- **Fallback must exist**: What happens if the browser does not support WASM
  (rare in 2024, but possible on old environments)?
- **Size needs monitoring**: WASM files can be huge. Check if `gzip` or `brotli`
  compression is working effectively on your CDN.

## Next Steps

- **Tool**: Use **Chrome DevTools** "WebAssembly" tab to step through the
  bytecode (if you are brave enough to read Assembly).
- **Learn**: Read the **Rust and WebAssembly** book.
- **Audit**: Measure the "Boot Time" of your WASM module. If it takes 5 seconds
  to load, the user is gone.
