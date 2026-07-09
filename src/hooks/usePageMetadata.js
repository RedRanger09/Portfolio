import { useEffect } from 'react'
import { SITE } from '../constants/site.js'

function setMeta(name, content, attribute = 'name') {
  let element = document.head.querySelector('meta[' + attribute + '="' + name + '"]')

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function usePageMetadata({ title, description, image, canonical, type = 'website' }) {
  useEffect(() => {
    const previousTitle = document.title
    const resolvedTitle = title ? title + ' | ' + SITE.name : SITE.title
    const resolvedDescription = description || SITE.description
    const resolvedImage = image || SITE.siteUrl + '/og-image.png'
    const resolvedCanonical = canonical || window.location.href

    document.title = resolvedTitle
    setMeta('description', resolvedDescription)
    setMeta('keywords', SITE.keywords.join(', '))
    setMeta('og:title', resolvedTitle, 'property')
    setMeta('og:description', resolvedDescription, 'property')
    setMeta('og:type', type, 'property')
    setMeta('og:url', resolvedCanonical, 'property')
    setMeta('og:image', resolvedImage, 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', resolvedTitle)
    setMeta('twitter:description', resolvedDescription)
    setMeta('twitter:image', resolvedImage)

    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', resolvedCanonical)

    return () => {
      document.title = previousTitle
    }
  }, [canonical, description, image, title, type])
}

export default usePageMetadata
