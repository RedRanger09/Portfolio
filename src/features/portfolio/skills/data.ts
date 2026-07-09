import type { SkillGroup, SkillsSectionContent } from './types'

const skillsSectionContent: SkillsSectionContent = {
  label: 'Skills',
  title: 'What I work with',
  subtitle: 'Tools and frameworks I reach for when building coursework and side projects.',
}

const skillGroups: SkillGroup[] = [
  {
    title: 'Programming',
    icon: 'Code2',
    accent: 'cyan',
    items: [
      { name: 'Python', logo: 'python' },
      { name: 'JavaScript', logo: 'javascript' },
      { name: 'Java', logo: 'java' },
      { name: 'C++', logo: 'cplusplus' },
      { name: 'SQL', logo: 'mysql' },
      { name: 'HTML5', logo: 'html5' },
      { name: 'CSS3', logo: 'css3' },
    ],
    note: 'Daily languages for coursework and projects',
  },
  {
    title: 'AI / ML',
    icon: 'Brain',
    accent: 'purple',
    items: [
      { name: 'PyTorch', logo: 'pytorch' },
      { name: 'TensorFlow', logo: 'tensorflow' },
      { name: 'scikit-learn', logo: 'scikitlearn' },
      { name: 'OpenCV', logo: 'opencv' },
      { name: 'Streamlit', logo: 'streamlit' },
      { name: 'Google Gemini', logo: 'googlegemini' },
      { name: 'LM Studio', logo: 'ollama' },
    ],
    note: 'Where most of my project energy goes',
  },
  {
    title: 'Frameworks & Web',
    icon: 'Layout',
    accent: 'emerald',
    items: [
      { name: 'React', logo: 'react' },
      { name: 'Node.js', logo: 'nodedotjs' },
      { name: 'TailwindCSS', logo: 'tailwindcss' },
      { name: 'Vite', logo: 'vite' },
      { name: 'Framer Motion', logo: 'framer' },
      { name: 'FastAPI', logo: 'fastapi' },
    ],
    note: 'Frontends and backends for my AI projects',
  },
  {
    title: 'Developer Tools',
    icon: 'Wrench',
    accent: 'amber',
    items: [
      { name: 'Git', logo: 'git' },
      { name: 'GitHub', logo: 'github' },
      { name: 'VS Code', logo: 'visualstudiocode' },
      { name: 'Jupyter', logo: 'jupyter' },
      { name: 'Postman', logo: 'postman' },
      { name: 'Docker', logo: 'docker' },
    ],
    note: 'My everyday development environment',
  },
  {
    title: 'Cloud & APIs',
    icon: 'Cloud',
    accent: 'pink',
    items: [
      { name: 'Google Cloud', logo: 'googlecloud' },
      { name: 'Hugging Face', logo: 'huggingface' },
      { name: 'OpenAI', logo: 'openai' },
      { name: 'Coursera', logo: 'coursera' },
    ],
    note: 'APIs and platforms I integrate with',
  },
]

export async function getSkillGroups(): Promise<SkillGroup[]> {
  return skillGroups
}

export async function getSkillsSectionContent(): Promise<SkillsSectionContent> {
  return skillsSectionContent
}
