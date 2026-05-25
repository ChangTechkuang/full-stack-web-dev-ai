# Code Standards

## General

- Clean architecture
- Feature-based structure
- Reusable hooks
- Reusable UI system
- Minimal comments
- Clear naming conventions
- Avoid overengineering
- Prioritize readability
- Use server components when possible
- Use client components only when necessary

## TypeScript

- Use interface for object contracts.

## Next.js

- Default to React Server Components.
- Add "use client" only when the component needs browser interactivity, hooks, or real-time state.
- Keep route handlers focused on a single responsibility.
- Long-running work belongs in background tasks, not in request handlers.

## Styling

- Use CSS custom property tokens defined in globals.css — no raw Tailwind color classes like zinc-* or hardcoded hex values.
- Reference tokens through their Tailwind utility names: bg-base, text-copy-primary, border-surface-border, text-brand, etc.
- Maintain the border radius scale: rounded-xl for small elements, rounded-2xl for cards, rounded-3xl for modals.

## API Routes

- Validate and parse request input before any logic runs.

## Folder Structure

Use Feature-Sliced Design (FSD) is an architectural methodology for scaffolding front-end applications. Simply put, it's a compilation of rules and conventions on organizing code. The main purpose of this methodology is to make the project more understandable and stable in the face of ever-changing business requirements.

** Inlcude All folder into /src

- App — everything that makes the app run — routing, entrypoints, global styles, providers.
- Processes (deprecated) — complex inter-page scenarios.
- Pages — full pages or large parts of a page in nested routing.
- Widgets — large self-contained chunks of functionality or UI, usually delivering an entire use case.
- Features — reused implementations of entire product features, i.e. actions that bring business value to the user.
- Entities — business entities that the project works with, like user or product.
- Shared — reusable functionality, especially when it's detached from the specifics of the project/business, though not necessarily.

## RESTRICTIONS

- Do NOT hardcode API URLs
- Do NOT mix business logic into UI
- Do NOT skip validation
- Do NOT overuse client components
- Do NOT use unnecessary libraries
- Do NOT create duplicated hooks/components