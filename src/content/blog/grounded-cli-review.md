---
title: "Keep a CLI review grounded in evidence"
description: "A short example of tracing a requested behavior through implementation and observable checks."
pubDate: 2026-10-22
author: "Example content"
draft: false
example: true
tags:
  - CLI
  - code review
---

A useful review can be followed from the requested behavior to the code that
implements it and the check that proves it. That small evidence trail makes a
change easier to discuss without relying on guesswork.

## Start with the contract

Write the expected behavior in a sentence. Keep it specific enough that a
reader can tell what should happen for both ordinary and edge-case input.

## Find the owning code

Trace the relevant path from its entry point to the place where the behavior is
decided. A focused search is often more helpful than reading every file in a
repository.

## Verify the result

Prefer a small test that would fail if the contract were broken. For a command
line program, that may mean checking its exit status and output; for a static
site, it may mean inspecting the generated route and its links.

When the check passes, report what it actually covered. A passing test is useful
evidence for its assertion, not a claim that every possible behavior is correct.
