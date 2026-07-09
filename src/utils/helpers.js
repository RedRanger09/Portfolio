export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const formatTagId = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const isExternalHref = (href = '') =>
  href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
