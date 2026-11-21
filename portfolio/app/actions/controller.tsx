import { redirect } from 'remix/response/redirect'
import { createController } from 'remix/router'

import { gear, profile, projects } from '../data/projects.ts'
import { routes } from '../routes.ts'
import { HomePage } from './home-page.tsx'
import { introEntries, MAX_INPUT, runCommand, type TerminalData } from './public/terminal-commands.ts'

export default createController(routes, {
  actions: {
    home(context) {
      let data = terminalData()
      let history = introEntries()

      // Without JavaScript the terminal submits ?cmd=… here; run it on the server.
      let cmd = context.url.searchParams.get('cmd')?.slice(0, MAX_INPUT).trim()
      if (cmd) {
        let result = runCommand(cmd, data)
        if (result.navigate) return redirect(result.navigate, 303)
        history = result.clear ? [] : [...history, { cmd, lines: result.lines }]
      }

      return context.render(
        <HomePage terminal={{ data, history, action: `${routes.home.href()}#terminal` }} />,
        cmd ? { headers: { 'Cache-Control': 'no-store' } } : undefined,
      )
    },
  },
})

function terminalData(): TerminalData {
  return {
    projects: projects.map((project) => ({
      slug: project.slug,
      name: project.name,
      status: project.status,
      href: routes.projects.show.href({ slug: project.slug }),
    })),
    gear,
    githubHref: profile.github,
  }
}
