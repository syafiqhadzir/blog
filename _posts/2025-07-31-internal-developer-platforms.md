---
layout: post
title: 'Internal Developer Platforms: The Golden Path'
date: 2025-07-31
category: QA
slug: internal-developer-platforms
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
---
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Works on My Machine" Killer](#the-works-on-my-machine-killer)
- [Testing the Templates](#testing-the-templates)
- [Code Snippet: Templated Scaffold Verification](#code-snippet-templated-scaffold-verification)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

In 2015, DevOps meant "Every developer writes Terraform". It was chaos. Nobody understood what anyone else had built.
The infrastructure was a snowflake factory.

In 2025, we use **Internal Developer Platforms (IDPs)** like **Backstage**. Developers click "Create New Service" ->
Select "Node.js API" -> Click "Deploy". Infrastructure is invisible.

**QA Challenge**: If the Platform Team breaks the "Node.js API" template, 500 developers are blocked instantly. The
blast radius is enormous.

## TL;DR

- **Golden Paths reduce chaos**: The supported, blessed way to build software. QA must keep this path clear of
  obstacles.
- **Drift detection reveals decay**: Old services might be using last year's template. How do we update them without
  breaking everything?
- **Self-service is the metric**: If a developer has to open a Jira ticket to get a database, your IDP has failed.

## The "Works on My Machine" Killer

The IDP ensures that Development, Staging, and Production look exactly the same. It manages `k8s.yaml`, `Dockerfile`,
and `Helm Charts` centrally.

**QA Strategy**:

1. **Ephemeral Environments**: Every Pull Request gets a URL. Test there.
2. **Policy as Code**: Use OPA (Open Policy Agent) to block deployments that request `root` access.

## Testing the Templates

IDPs work by using "Scaffolding" (like `cookiecutter` or `yeoman`). You need to treat these templates as **Software
Products**.

They need versioning (`v1.2.0`), release notes, and automated tests. "If I generate a new app using `v1.2.0`, does `npm
test` pass out of the box?" If not, the template is broken.

## Code Snippet: Templated Scaffold Verification

Automating the testing of your IDP templates.

```javascript
/*
  scaffold-test.js
  Run this every time you update the "Golden Path" templates.
*/
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = './templates/nodejs-api';
const BUILD_DIR = './build-test-artifact';

try {
    console.log('🏗️ Generating service from template...');
    
    // 1. Clean previous build
    if (fs.existsSync(BUILD_DIR)) {
        fs.rmSync(BUILD_DIR, { recursive: true });
    }
    
    // 2. Run the Scaffolder (Simulation)
    // In Backstage this would be the 'software-templates' logic
    fs.cpSync(TEMPLATE_DIR, BUILD_DIR, { recursive: true });
    
    console.log('🧪 Testing generated service...');
    process.chdir(BUILD_DIR);
    
    // 3. Verify the generated code actually works
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm test', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    
    // 4. Verify default security settings
    const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
    if (!dockerfile.includes('USER node')) {
        throw new Error('SECURITY VIOLATION: Dockerfile must not run as root');
    }

    console.log('✅ Template is Valid.');
    
} catch (e) {
    console.error('❌ Template Broken:', e.message);
    process.exit(1);
}
```

## Summary

The Platform Team is a Product Team. Their customer is the Developer.

The IDP needs the same rigorous QA as the customer-facing app. If the IDP is flaky, developers will go "Shadow IT" and
spin up their own AWS instances. Then you have two problems instead of one.

## Key Takeaways

- **Catalogue health needs monitoring**: Use "Scorecards" to rate services (Silver, Gold, Platinum) based on their
  compliance with best practices.
- **Plugin interactions matter**: Backstage has hundreds of plugins. Test interactions between them.
- **Documentation is infrastructure**: The IDP is also the documentation hub. Broken links = developer frustration.

## Next Steps

- **Tool**: **Backstage.io** (Spotify) or **Port**.
- **Learn**: Understand **OPA** (Open Policy Agent) for governance.
- **Metric**: Track **DORA Metrics** (Deployment Frequency, Lead Time) automatically via the IDP.
