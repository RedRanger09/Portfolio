import { revalidatePath } from 'next/cache'

/**
 * Invalidates cached public pages after CMS / media mutations.
 * Paths are listed explicitly so homepage section gates and collection
 * filters refresh immediately after visibility toggles.
 */
export function revalidatePublicContent(): void {
  revalidatePath('/', 'layout')
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
  revalidatePath('/projects/[slug]', 'page')
  revalidatePath('/sitemap.xml')
}
