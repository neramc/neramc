import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { projects } from '../../data/projects.ts'
import { router } from '../../router.ts'
import { routes } from '../../routes.ts'

function get(path: string) {
  return router.fetch(new Request(new URL(path, 'http://localhost')))
}

describe('projects controller', () => {
  it('GET /projects lists active and archived projects', async () => {
    let response = await get(routes.projects.index.href())

    assert.equal(response.status, 200)
    let html = await response.text()
    assert.ok(html.includes('장착 중') && html.includes('보관함'))
    for (let project of projects) {
      assert.ok(html.includes(routes.projects.show.href({ slug: project.slug })), project.slug)
    }
  })

  it('GET /projects/:slug renders the project with its repository link', async () => {
    let response = await get(routes.projects.show.href({ slug: 'app-deleter' }))

    assert.equal(response.status, 200)
    let html = await response.text()
    assert.ok(html.includes('찌꺼기까지 지우는 Windows 앱 삭제기'))
    assert.ok(html.includes('https://github.com/neramc/app-deleter/releases/tag/v2.0.0'))
  })

  it('returns 404 for an unknown project', async () => {
    let response = await get(routes.projects.show.href({ slug: 'nope' }))

    assert.equal(response.status, 404)
  })
})
