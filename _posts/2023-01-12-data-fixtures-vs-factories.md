---
layout: post
title: 'Data Fixtures vs Factories: Stop Hardcoding Your Database'
date: 2023-01-12
category: QA
slug: data-fixtures-vs-factories
gpgkey: EBE8 BD81 6838 1BAF
tags: ['data-engineering', 'data-testing', 'philosophy']
description:
  'Managing test data is like feeding a toddler: if you feed them rubbish, you
  are going to have a messy situation later.'
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The Problem with Fixtures (Frozen Pizza)](#the-problem-with-fixtures-frozen-pizza)
- [The Power of Factories (Home Cooking)](#the-power-of-factories-home-cooking)
- [Code Snippet: Using Faker like a Pro](#code-snippet-using-faker-like-a-pro)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

Managing test data is like feeding a toddler: if you feed them rubbish, you are
going to have a messy situation later.

In the world of automated testing, we have two main schools of thought for
setting up data: **Static Fixtures** and **Dynamic Factories**. One is quick and
dirty; the other is elegant but requires you to actually write code. Let us
fight.

## TL;DR

- **Fixtures are static**: Hardcoded JSON/SQL files. Fast to write, impossible
  to maintain.
- **Factories are dynamic**: Dynamic code generation. Flexible, robust, and
  readable.
- **Rule of Thumb**: Use factories for business entities (Users, Orders). Use
  fixtures for static reference data (Countries, Currencies).
- **Maintenance matters**: Fixtures rot. Factories evolve.

## The Problem with Fixtures (Frozen Pizza)

Static fixtures are specific JSON or SQL dump files you load before a test.

- **Pros**: Lightning fast. It is just reading a file.
- **Cons**: The "Mystery Guest" problem. You read a test that says
  `loadFixtures()`, and then `expect(user.isAdmin).toBe(true)`. Why is he an
  admin? You have to open `users.json`, `roles.json`, and `permissions.json` to
  find out.

Also, if you add a required column `middle_name` to your database, you now have
to update 50 JSON files manually. Have fun with that.

## The Power of Factories (Home Cooking)

Factories (like `FactoryBot` in Ruby, or custom TS factories) generate data on
the fly. You define a blueprint, and the factory builds a valid object,
overriding only what you need.

It makes tests readable. You can see _exactly_ what is relevant to the test
case: `const admin = UserFactory.create({ isAdmin: true })`

## Code Snippet: Using Faker like a Pro

Here is a simple, robust factory pattern in TypeScript using `faker`.

```typescript
import { faker } from '@faker-js/faker';

// The Type Definition
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

// The Factory: Returns a valid User every time
export const UserFactory = (overrides: Partial<User> = {}): User => {
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    role: 'user', // Default value
    isActive: true, // Default value
    ...overrides, // Allow tests to specify only what matters
  };
};

// Usage in Test
test('Admin can delete posts', () => {
  // We only care that the role is admin; the rest is noise.
  // We don't care what the email is, so let the factory handle it.
  const adminUser = UserFactory({ role: 'admin' });

  console.log(adminUser);
  // Output: { id: '...', username: 'CoolGuy99', role: 'admin', ... }
});
```

This ensures that every test gets a unique, valid user. No more "Unique
Constraint Violation" errors because you reused `id: 1` in two tests running in
parallel.

## Summary

Data isolation is the enemy of flakiness. By adopting a factory-first approach,
you reduce the risk of side effects where one test's data pollutes another's
environment.

Fixtures are like frozen pizza—okay for a quick snack, but if you eat them every
day, you will get scurvy. Factories are the home-cooked meal of testing.

## Key Takeaways

- **Readability is improved**: Factories make the intent of the test clear.
- **Resilience to change**: Factories are resilient to schema changes. You
  update the Factory once, and all 500 tests are fixed.
- **Randomness finds bugs**: Random data helps find edge cases (e.g., names with
  apostrophes) that you would not think to write manually.

## Next Steps

- **Install Faker**: `npm install --save-dev @faker-js/faker`. Do it now.
- **Build a Factory**: Create a factory for your main `User` entity.
- **Delete JSONs**: Slowly replace your static fixtures with factory calls. Feel
  the weight lift off your shoulders.
