import type { JourneyStep } from './types'

const learningJourney: JourneyStep[] = [
  {
    id: 'btech',
    label: 'Started B.Tech Computer Science',
    year: '2024',
    description: 'Enrolled in B.Tech Computer Science at SRMCEM. Began building strong CS fundamentals alongside coursework.',
    icon: 'GraduationCap',
    accent: 'purple',
  },
  {
    id: 'programming',
    label: 'Programming Fundamentals',
    year: '2024',
    description: 'Built a solid base in programming — logic, data structures, algorithms, and problem-solving patterns through coursework and practice.',
    icon: 'TerminalSquare',
    accent: 'emerald',
  },
  {
    id: 'python',
    label: 'Python',
    year: '2024',
    description: 'Learned Python for data manipulation, scripting, and automation. Became my go-to language for ML experiments.',
    icon: 'Code2',
    accent: 'emerald',
  },
  {
    id: 'web',
    label: 'Web Development',
    year: '2024',
    description: 'Got into web development so I could build real, usable interfaces for my projects. Learned React, Tailwind CSS, and the modern frontend stack.',
    icon: 'Globe',
    accent: 'cyan',
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    year: '2024',
    description: 'Started exploring ML concepts — linear models, gradient descent, evaluation metrics, and the intuition behind learning algorithms.',
    icon: 'Brain',
    accent: 'purple',
  },
  {
    id: 'andrew',
    label: 'Andrew Ng ML Specialization',
    year: '2025–2026',
    description: 'Completed Supervised ML: Regression & Classification and Advanced Learning Algorithms on Coursera. Strong foundation in regression, neural networks, and decision trees.',
    icon: 'Award',
    accent: 'amber',
  },
  {
    id: 'ibm',
    label: 'IBM Artificial Intelligence Virtual Internship',
    year: '2025',
    description: "Completed IBM's AI Virtual Internship — applied ML concepts to structured real-world tasks and received certification from IBM.",
    icon: 'Building2',
    accent: 'cyan',
  },
  {
    id: 'nvidia',
    label: 'NVIDIA — Getting Started with Deep Learning',
    year: '2025',
    description: "Completed NVIDIA's Deep Learning course. Trained CNNs and gained hands-on GPU-accelerated training experience on real datasets.",
    icon: 'Zap',
    accent: 'emerald',
  },
  {
    id: 'cnn',
    label: 'CNN Projects',
    year: '2025',
    description: 'Built CNN-based classifiers from scratch — Fashion MNIST and Sign Language Recognition. Moved from theory to real training pipelines with evaluation.',
    icon: 'Image',
    accent: 'pink',
  },
  {
    id: 'lumora',
    label: 'Lumora',
    year: '2025–2026',
    description: 'Built Lumora — a full RAG-based academic assistant using FAISS, Google Gemini, and a React frontend. My most complete end-to-end project.',
    icon: 'Sparkles',
    accent: 'cyan',
  },
  {
    id: 'current',
    label: 'Currently Learning',
    year: 'Now',
    description: 'Actively exploring agentic AI systems, advanced RAG architectures (hybrid retrieval, reranking), and LLM evaluation — building intuition through hands-on experiments.',
    subItems: ['Agentic AI', 'Advanced RAG', 'LLM Evaluation'],
    icon: 'Workflow',
    accent: 'purple',
    isCurrent: true,
  },
]

export async function getLearningJourney(): Promise<JourneyStep[]> {
  return learningJourney
}
