/**
 * URLs of the built browser entry, as the document shell needs them.
 *
 * `entry.server.ts` fills this in from Vite's `?assets=client` manifest before
 * the router handles a request. The dev fallback keeps the router importable
 * from `remix test`, which runs on Node without Vite's module pipeline.
 */
export interface ClientAssets {
  entry?: string
  css: { href: string }[]
}

export const clientAssets: ClientAssets = {
  entry: '/app/entry.client.ts',
  css: [],
}

export function setClientAssets(assets: ClientAssets) {
  clientAssets.entry = assets.entry ?? clientAssets.entry
  clientAssets.css = assets.css ?? []
}
