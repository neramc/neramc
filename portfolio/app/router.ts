import { createRouter, type RouterContext } from 'remix/router'
import { render } from 'remix/middleware/render'

import controller from './actions/controller.tsx'
import { notFound } from './actions/not-found-page.tsx'
import projectsController from './actions/projects/controller.tsx'
import { routes } from './routes.ts'

// Nitro serves the built client bundle and `public/` from the output's static
// directory, so the router only owns application routes. Client entries carry
// public module URLs, which keeps `render()` free of a runtime asset server.
export const router = createRouter({
  middleware: [render()],
  defaultHandler: (context) => notFound(context),
})

export type AppContext = RouterContext<typeof router>

declare module 'remix' {
  interface RouterTypes {
    context: AppContext
  }
}

router.map(routes, controller)
router.map(routes.projects, projectsController)
