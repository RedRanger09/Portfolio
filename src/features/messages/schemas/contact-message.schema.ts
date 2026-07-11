import { z } from 'zod'
import { countWords, MAX_MESSAGE_WORDS } from '../lib/word-count'

export const contactMessageStatusSchema = z.enum(['UNREAD', 'READ', 'ARCHIVED'])

/** Hard character ceiling so spam payloads fail before word counting. */
const MAX_MESSAGE_CHARS = 4000

export const createContactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(100, 'Name must be at most 100 characters.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .max(254, 'Email is too long.')
    .email('Enter a valid email address.'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required.')
    .max(MAX_MESSAGE_CHARS, 'Message is too long.')
    .refine((value) => countWords(value) <= MAX_MESSAGE_WORDS, {
      message: `Message must be at most ${MAX_MESSAGE_WORDS} words.`,
    }),
  /** Honeypot — must stay empty. Bots that fill hidden fields are rejected. */
  website: z.string().max(200).optional().default(''),
  /** Client timestamp when the form mounted — used for timing checks. */
  formStartedAt: z.number().int().positive(),
})

export const updateContactMessageStatusSchema = z.object({
  id: z.string().min(1),
  status: contactMessageStatusSchema,
})

export const deleteContactMessageSchema = z.object({
  id: z.string().min(1),
})

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>
export type UpdateContactMessageStatusInput = z.infer<typeof updateContactMessageStatusSchema>
export type DeleteContactMessageInput = z.infer<typeof deleteContactMessageSchema>

export { countWords, MAX_MESSAGE_WORDS }
