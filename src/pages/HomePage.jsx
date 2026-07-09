import { useState } from 'react'
import {
  HeroSection,
  AboutSection,
  LearningJourneySection,
  SkillsSection,
  ProjectsSection,
  EducationSection,
  CertificationsSection,
  ResumeSection,
  ContactSection,
} from '../sections/lab/LabSections.jsx'
import usePageMetadata from '../hooks/usePageMetadata.js'
import useGsapReveal from '../hooks/useGsapReveal.js'
import LoadingSequence from '../components/lab/LoadingSequence.jsx'

function HomePage() {
  usePageMetadata({})
  const [loaded, setLoaded] = useState(false)
  const revealRef = useGsapReveal(loaded)

  return (
    <>
      <LoadingSequence onComplete={() => setLoaded(true)} />
      {loaded && (
        <div ref={revealRef}>
          <HeroSection />
          <div data-lab-reveal><AboutSection /></div>
          <div data-lab-reveal><LearningJourneySection /></div>
          <div data-lab-reveal><SkillsSection /></div>
          <div data-lab-reveal><ProjectsSection /></div>
          <div data-lab-reveal><EducationSection /></div>
          <div data-lab-reveal><CertificationsSection /></div>
          <div data-lab-reveal><ResumeSection /></div>
          <div data-lab-reveal><ContactSection /></div>
        </div>
      )}
    </>
  )
}

export default HomePage
