import { createRouter, type RouterContext } from 'remix/router'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'

import controller from './actions/controller.tsx'
import { notFound } from './actions/not-found-page.tsx'
import projectsController from './actions/projects/controller.tsx'
import { assets } from './assets.ts'
import { routes } from './routes.ts'

export const router = createRouter({
  middleware: [
    staticFiles('./public', { index: false, cacheControl: 'public, max-age=3600' }),
    render({ assets }),
  ],
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
