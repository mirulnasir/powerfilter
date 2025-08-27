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

### Filter design

- Inspired by Hygraph CMS filter (https://hygraph.com/docs/developer-guides/content/using-filters), however, in hygraph, its auto search filter, without `Apply Filter` button.
- The reason why I dont use auto filter, because other than not enough time, I opted for similar solution used in Amazon marketplace where they're using apply filter rather than auto filter on change.

### Data fetching via Tanstack Query

- The truth: CACHING IS THE HARDEST THING TO DEBUG.
- Go to library, to handle caching, and key invalidation.
- based on `considerations of a complete CRUD`, for this kind of project, the functionality is going to be quite complex especially when we start doing mutations.
- Devtools allows the team to see the whole fetching process, and debugging is easier.
- It reduces the boilerplate code, and makes the code more readable for example when fetching, we usually need to consider the loading state, error state, and success state.
- When we start adding mutations, we can consider doing optimistic update, and reactively update the UI.

### Structure

- File and folder structure is using `colocation` principle (https://kentcdodds.com/blog/colocation)
- instead of `Ruby` (group by type) style structure.
- colocation focuses on domain or feature, makes it easier to scale and maintain.

### Fetching strategy

- Api calls are fetched from server side, through Tanstack Prefetching.
- `useQuery` allows us to handle onload fetching as well as manual fetching.
- Caching of request is controlled via query keys, where they're determined by filter params, sorting params, and pagination params.
- Caching can be seen when we're requesting the same url with the same params, we can see instant update, even from the browser devtools.
