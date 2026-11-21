import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { router } from '../router.ts'
import { routes } from '../routes.ts'

function get(path: string) {
  return router.fetch(new Request(new URL(path, 'http://localhost')))
}

describe('root controller', () => {
  it('GET / renders the home page with every project and the terminal', async () => {
    let response = await get(routes.home.href())

    assert.equal(response.status, 200)
    assert.match(response.headers.get('Content-Type') ?? '', /text\/html/)
    let html = await response.text()
    assert.match(html, /<html lang="ko"/)
    for (let name of ['Linuxhub', 'App Deleter', 'Quill', 'Markdown Studio', 'Connection Verify']) {
      assert.ok(html.includes(name), `missing ${name}`)
    }
    assert.match(html, /name="cmd"/)
  })

  it('runs a terminal command on the server when JavaScript is off', async () => {
    let response = await get(`${routes.home.href()}?cmd=whoami`)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    let html = await response.text()
    assert.ok(html.includes('I build web apps and native desktop tools.'))
  })

  it('redirects `open <project>` to the project page', async () => {
    let response = await get(`${routes.home.href()}?cmd=${encodeURIComponent('open quill')}`)

    assert.equal(response.status, 303)
    assert.equal(response.headers.get('Location'), routes.projects.show.href({ slug: 'quill' }))
  })

  it('renders the pixel 404 page for unknown URLs', async () => {
    let response = await get('/no/such/page')

    assert.equal(response.status, 404)
    assert.ok((await response.text()).includes('이 광석은 아직 캐지 않았어요.'))
  })
})
