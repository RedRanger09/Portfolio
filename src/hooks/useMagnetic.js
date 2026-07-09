import { useRef } from 'react'

function useMagnetic(strength = 0.35) {
  const ref = useRef(null)

  const onMouseMove = (event) => {
    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    node.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const onMouseLeave = () => {
    const node = ref.current
    if (!node) return
    node.style.transform = 'translate(0px, 0px)'
  }

  return { ref, onMouseMove, onMouseLeave }
}

export default useMagnetic
