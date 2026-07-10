# Phase 15 — Public contact form → Messages inbox

## Goal

Visitors can submit Name / Email / Message from the public Contact section.
Every submission persists as `ContactMessage` and appears in Admin → Messages.
Resend email is best-effort and never blocks a successful save.

## Folder changes

| Path | Change |
|------|--------|
| `src/features/messages/schemas/contact-message.schema.ts` | `createContactMessageSchema`, word-count helper (max 100) |
| `src/features/messages/actions/create-contact-message.ts` | Public Server Action (no auth) |
| `src/lib/resend.ts` | `sendContactNotificationEmail` via Resend HTTP API (no SDK) |
| `src/features/portfolio/contact/components/contact-form.tsx` | Minimal client form |
| `src/features/portfolio/contact/components/contact-section.tsx` | Mounts form below methods grid |

## Flow

1. Client `ContactForm` → `createContactMessage`
2. Zod validate → `prisma.contactMessage.create` (`UNREAD`, subject `Portfolio contact`, body = message)
3. Best-effort Resend notification to `ADMIN_EMAIL` or `SITE.email`
4. Admin `getMessagesForAdmin` lists new rows automatically

## Validation

Trimmed name/email/message; email format; max 100 words; 4000-char hard ceiling.
