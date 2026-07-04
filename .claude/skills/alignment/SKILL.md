---
name: alignment
description: Reach alignment on the design spec by relentlessly interviewing the user.
disable-model-invocation: true
---

Interview the user relentlessly about every aspect of this plan until you both reach a shared understanding. Walk down each branch of the design tree, dispelling ambiguity and resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

## Interview style

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a question can be answered by exploring the project files, do that instead.

## Definitions and terminology

While interviewing the user you should be actively sharpening and refining definitions and terminology in the spec.

### Challenge ambiguity

When the user uses a term that conflicts with established definitions within the spec, call it out immediately. "Your spec defines 'such and such' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."
