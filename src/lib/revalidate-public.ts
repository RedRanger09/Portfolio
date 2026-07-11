import { revalidatePath } from 'next/cache'

/**
 * Invalidates cached public pages after CMS / media mutations.
 *
 * `revalidatePath('/', 'layout')` covers the public `(site)` tree (home,
 * projects, blog) so visitors see CMS updates without a redeploy.
 */
export function revalidatePublicContent(): void {
  revalidatePath('/', 'layout')
  revalidatePath('/sitemap.xml')
}
