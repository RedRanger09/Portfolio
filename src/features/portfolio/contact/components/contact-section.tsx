import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getContactInfo } from '../data'
import { ContactMethodsGrid } from './contact-methods-grid'
import { ContactCta } from './contact-cta'

/** Contact — server component: fetches every contact method and the closing CTA copy. */
export async function ContactSection() {
  const contact = await getContactInfo()

  return (
    <section id="contact" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="contact" />
      <div className="relative mx-auto max-w-2xl">
        <SectionHeader label={contact.label} title={contact.title} subtitle={contact.description} align="center" theme="contact" />
        <ContactMethodsGrid methods={contact.methods} />
        <ContactCta href={contact.sayHelloHref} label={contact.sayHelloLabel} />
      </div>
    </section>
  )
}
