## Problems

### Sentry issues with Turbopack (Resolved)

- https://github.com/vercel/next.js/issues/70424

### Ran into hydration error

- caused by id generation in filter-inline.tsx
- fixed by removing use of id's in the css.
- not ideal, but it's a quick fix. since we're not really use the id's in the css.

### Slow client side fetching.

- Fetching requests are happening on client side because of client components.
- Since we want to force fetching on the server, we use prefetching in React Query, which happens on the server.
- When client is loaded, the data is already fetched, and the UI is rendered instantly.
- If we're not using React Query, we dont really need to worry about this, because we're most likely using server components. But it's a tradeoff we're making for faster development and better reliability.
