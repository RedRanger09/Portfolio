import type { AboutData } from './types'

const aboutData: AboutData = {
  title: 'My journey (so far)',
  story: [
    "I'm a B.Tech Computer Science student who started with programming fundamentals and small scripts.",
    'From there I got into web development so I could turn ideas into usable projects.',
    'Over time I became curious about Machine Learning, so I started the Andrew Ng ML Specialization and kept going into Deep Learning.',
    "Lately I've been most interested in RAG + LLMs — and I'm currently exploring agentic AI systems and how to evaluate them properly.",
  ],
  currentlyLearning: {
    title: 'Currently learning',
    items: [
      'Hybrid retrieval and reranking for better RAG',
      'Evaluating LLM outputs more systematically',
      'Strengthening fundamentals in deep learning',
    ],
  },
  interests: ['Machine Learning', 'RAG systems', 'Full-stack web', 'Building useful student tools'],
}

export async function getAboutData(): Promise<AboutData> {
  return aboutData
}
