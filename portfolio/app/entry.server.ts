import entryAssets from './entry.client.ts?assets=client'
import { setClientAssets } from './client-assets.ts'
import { router } from './router.ts'

// Vite replaces this import with the built client entry's URLs: the hashed
// script in production, the source URL on the dev server. The document reads
// them through `client-assets.ts` so server unit tests can import the router
// without a Vite-only import in their graph.
setClientAssets(entryAssets)

export default { fetch: router.fetch }
