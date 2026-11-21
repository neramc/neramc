import { get, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: '/',
  projects: {
    index: get('/projects'),
    show: get('/projects/:slug'),
  },
})
