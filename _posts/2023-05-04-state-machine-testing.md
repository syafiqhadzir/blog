---
layout: post
title: 'State Machine Testing: Escaping Boolean Hell'
date: 2023-05-04
category: QA
slug: state-machine-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Spaghetti Problem](#the-spaghetti-problem)
- [State Machines vs Boolean Flags](#state-machines-vs-boolean-flags)
- [Code Snippet: A Predictable Machine](#code-snippet-a-predictable-machine)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Most application code is "Boolean Spaghetti". Flags like `isLoading`, `isError`, `isSuccess`, and `hasUserClickedThatButton` are scattered everywhere.

Before you know it, your app is in a state where `isLoading` is true, but `isError` is also true, and the user is somehow logged in and logged out simultaneously.

**State Machines** (finite state automata) solve this by defining strict rules. Testing them is a joy because you do not test "scenarios" (guessing); you test the *model* itself (maths).

## TL;DR

- **Impossible States are prevented**: Ensure users cannot be "Paid" and "Pending" at the same time.
- **Graph Traversal tests all paths**: Test that every arrow in your diagram can be followed.
- **Determinism is guaranteed**: Input A + State B must *always* equal State C.
- **No Magic exists**: If it is not in the graph, it cannot happen.

## The Spaghetti Problem

In traditional testing, you write steps: "Click A, then B, expect C."

In **Model-Based Testing**, you say: "Here are all the paths. Computer, please explore them all."

This creates a graph of your application. If there is a path where a user can bypass payment and go straight to "Shipping", the state machine test will find it. Your manual test plan (which assumes users behave logically) will miss it every time.

## State Machines vs Boolean Flags

Boolean flags are independent.

- `isLoading` (True/False)
- `isError` (True/False)
- `hasData` (True/False)

That is 2^3 = 8 possible states. But only 3 are valid (Loading, Error, content). The other 5 are bugs waiting to happen (e.g., Loading AND Error). State Machines make those 5 states impossible to represent.

## Code Snippet: A Predictable Machine

Here is a simple traffic light machine. We test that it adheres to the correct transitions (Red -> Green -> Yellow -> Red).

```javascript
/* 
  State Machine Def:
  - IDLE -> FETCHING -> SUCCESS
                     -> ERROR -> IDLE
*/

const machine = {
  state: 'IDLE',
  transition(event) {
    switch (this.state) {
      case 'IDLE':
        if (event === 'FETCH') return 'FETCHING';
        break;
      case 'FETCHING':
        // Only two exits: Success or Fail
        if (event === 'RESOLVE') return 'SUCCESS';
        if (event === 'REJECT') return 'ERROR';
        break;
      case 'ERROR':
        if (event === 'RETRY') return 'IDLE';
        break;
    }
    // If the event is invalid for current state, do nothing.
    return this.state; 
  }
};

describe('Traffic Light Machine', () => {
  it('should not allow skipping states', () => {
    machine.state = 'IDLE';
    // You cannot Resolve before you Fetch.
    const nextState = machine.transition('RESOLVE');
    
    expect(nextState).toBe('IDLE'); 
  });

  it('should handle the happy path', () => {
    machine.state = 'IDLE';
    machine.state = machine.transition('FETCH');
    expect(machine.state).toBe('FETCHING');
    
    machine.state = machine.transition('RESOLVE');
    expect(machine.state).toBe('SUCCESS');
  });
});
```

This is simple, but imagine this logic handling a checkout flow with 50 inputs. The machine ensures you cannot reach `CONFIRMED` without passing through `PAYMENT_APPROVED`.

## Summary

Formalising your application state makes it easier to test and harder to break. It turns "spaghetti code" into a predictable, testable map (a directed graph) of user behaviour.

If you can draw it, you can test it. If you cannot draw it, you do not understand it.

## Key Takeaways

- **Explicit Rules define impossible states**: Define what *cannot* happen.
- **Visualisation aids communication**: Use tools like XState Visualiser to show stakeholders the logic.
- **Simplification reduces complexity**: Complex UIs are just a series of simple states connected by events.

## Next Steps

- **Refactor**: Take one hairy boolean-heavy component (`if (!loading && !error && data)`) and rewrite it as a switch statement.
- **Learn**: Check out `XState` docs.
- **Draw**: Whiteboard your login flow. You will find edge cases immediately.
