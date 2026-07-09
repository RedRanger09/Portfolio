export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
}

export const revealViewport = {
  once: true,
  amount: 0.24,
}

export const transition = {
  duration: 0.55,
  ease: 'easeOut',
}

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}
