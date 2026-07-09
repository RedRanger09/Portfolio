import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function useGsapReveal(enabled = true, selector = '[data-lab-reveal]') {
  const scopeRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined

    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, scopeRef)

    return () => ctx.revert()
  }, [enabled, selector])

  return scopeRef
}

export default useGsapReveal
