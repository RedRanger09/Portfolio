const slugMap = {
  // languages
  Python: 'python',
  JavaScript: 'javascript',
  Java: 'java',
  'C++': 'cplusplus',
  SQL: 'mysql',
  MySQL: 'mysql',
  PostgreSQL: 'postgresql',
  HTML5: 'html5',
  CSS3: 'css3',

  // AI / ML
  PyTorch: 'pytorch',
  TensorFlow: 'tensorflow',
  'scikit-learn': 'scikitlearn',
  'Scikit-learn': 'scikitlearn',
  OpenCV: 'opencv',
  Streamlit: 'streamlit',
  'Google Gemini': 'googlegemini',
  'Gemini API': 'googlegemini',
  'LM Studio': 'ollama',
  FAISS: 'meta',
  'Hugging Face': 'huggingface',
  OpenAI: 'openai',

  // web / frameworks
  React: 'react',
  'Node.js': 'nodedotjs',
  Node: 'nodedotjs',
  FastAPI: 'fastapi',
  Vite: 'vite',
  TailwindCSS: 'tailwindcss',
  'Tailwind CSS': 'tailwindcss',
  'Framer Motion': 'framer',
  'React Router': 'reactrouter',
  Flask: 'flask',
  Django: 'django',

  // tools
  Git: 'git',
  GitHub: 'github',
  Docker: 'docker',
  Jupyter: 'jupyter',
  'VS Code': 'visualstudiocode',
  Postman: 'postman',
  Figma: 'figma',

  // cloud / APIs / platforms
  'Google Cloud': 'googlecloud',
  Coursera: 'coursera',
  IBM: 'ibm',
  NVIDIA: 'nvidia',
}

export function getTechLogoSlug(name) {
  return slugMap[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function getTechLogoUrl(name, color = 'a1a1aa') {
  const slug = getTechLogoSlug(name)
  return `https://cdn.simpleicons.org/${slug}/${color}`
}
