import { get, route } from 'remix/routes'

export const routes = route({
  home: '/',
  projects: {
    index: get('/projects'),
    show: get('/projects/:slug'),
  },
})
