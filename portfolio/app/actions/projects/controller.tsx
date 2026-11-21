import { createController } from 'remix/router'

import { getProject, projects } from '../../data/projects.ts'
import { routes } from '../../routes.ts'
import { notFound } from '../not-found-page.tsx'
import { ProjectsIndexPage } from './index-page.tsx'
import { ProjectPage } from './show-page.tsx'

export default createController(routes.projects, {
  actions: {
    index(context) {
      return context.render(<ProjectsIndexPage />)
    },
    show(context) {
      let project = getProject(context.params.slug)
      if (!project) return notFound(context)

      let index = projects.indexOf(project)
      let previous = projects[(index - 1 + projects.length) % projects.length]
      let next = projects[(index + 1) % projects.length]
      return context.render(<ProjectPage project={project} previous={previous} next={next} />)
    },
  },
})
