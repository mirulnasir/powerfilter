## Architecture & Dependencies

### URL Structure

- For filter
- `?limit=10&page=1&filter=base%3AcreatedAt%3Ane%3A1736996973197&sort=updatedAt%3AASC`
- the format is inspired by how Supabase handles filters to search params
- structure, `{baseOrAtribute}:{key}:{operator}:{value}`
  - `base` is the base of the filter, it can be `base` or `attribute`
  - `key` is the key of the filter e.g. `createdAt`
  - `operator` is the operator of the filter e.g. `ne`
  - `value` is the value of the filter e.g. `1736996973197`

- For sort
- `?sort=updatedAt%3AASC`
- the format is inspired by how Supabase handles sort to search params
- structure, `{key}:{direction}`
  - `key` is the key of the sort e.g. `updatedAt`
  - `direction` is the direction of the sort e.g. `ASC`

- For pagination
- `?limit=10&page=1`
- the format is inspired by how Supabase handles pagination to search params
- structure, `{limit}:{page}`

### Data fetching via Tanstack Query

- The truth: CACHING IS THE HARDEST THING TO DEBUG.
- Go to library, to handle caching, and key invalidation.
- based on `considerations of a complete CRUD`, for this kind of project, the functionality is going to be quite complex especially when we start doing mutations.
- Devtools allows the team to see the whole fetching process, and debugging is easier.
- It reduces the boilerplate code, and makes the code more readable for example when fetching, we usually need to consider the loading state, error state, and success state.

### Structure

- File and folder structure is using `colocation` principle (https://kentcdodds.com/blog/colocation)
- instead of `Ruby` (group by type) style structure.
- colocation focuses on domain or feature, makes it easier to scale and maintain.
