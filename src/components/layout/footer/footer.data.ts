/**
 * Footer copy is layout-owned, not portfolio content — it isn't part of any
 * feature's domain, so it's colocated with its sole consumer instead of
 * living in a shared/global data file.
 */
export interface FooterData {
  statement: string
}

const footerData: FooterData = {
  statement: 'Built by Akshay — CS student learning in public through AI projects.',
}

export async function getFooterData(): Promise<FooterData> {
  return footerData
}
