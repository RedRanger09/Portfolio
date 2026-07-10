import { z } from 'zod'

const contactMethodIconSchema = z.enum(['github', 'linkedin', 'email', 'location'])

const contactMethodSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  href: z.string().min(1),
  icon: contactMethodIconSchema,
})

/**
 * `ContactInformation` is a singleton with owned `SocialLink` children —
 * see `hero.schema.ts`'s note on why there's only an update, no
 * create/delete. `methods` replaces the entire ordered set of social
 * links in one call (`update-contact-information.ts`), matching the
 * `@@unique([contactInformationId, icon])` constraint: one link per icon.
 */
export const updateContactInformationSchema = z.object({
  label: z.string().min(1, 'Label is required.'),
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  methods: z
    .array(contactMethodSchema)
    .min(1, 'At least one contact method is required.')
    .refine((methods) => new Set(methods.map((m) => m.icon)).size === methods.length, {
      message: 'Each contact method icon must be unique.',
    }),
  sayHelloLabel: z.string().min(1, 'Say-hello label is required.'),
  sayHelloHref: z.string().min(1, 'Say-hello href is required.'),
})

export type UpdateContactInformationInput = z.infer<typeof updateContactInformationSchema>
