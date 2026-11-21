import { run } from 'remix/component'

import './actions/public/app.css'

// Vite turns this into a static map of
// { '/app/...': () => import('/app/...') } at build time. The negative pattern
// keeps server-only modules and declaration files out of the client graph.
const modules = import.meta.glob<Record<string, unknown>>([
  '/app/**/*.{ts,tsx,js,jsx}',
  '!/app/**/*.server.*',
  '!/app/**/*.test.*',
  '!/app/**/*.d.ts',
  '!/app/entry.client.*',
])

// The server serializes each client entry as its public module URL — the
// `/assets/<source path>` prefix the asset server used to own. Strip it so the
// id matches an `import.meta.glob` key, and let Vite hand back the built chunk.
const app = run({
  async loadModule(moduleUrl, exportName) {
    let key = moduleUrl.replace(/^\/assets/, '')
    let load = modules[key]
    if (!load) {
      throw new Error(`Unknown module: ${moduleUrl}`)
    }
    let Component = (await load())[exportName]
    if (typeof Component !== 'function') {
      throw new Error(`Unknown component: ${moduleUrl}#${exportName}`)
    }
    return Component
  },
})

app.addEventListener('error', (event) => {
  console.error(event.error)
})
