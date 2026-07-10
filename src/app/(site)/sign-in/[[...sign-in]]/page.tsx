import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

const clerkAppearance = {
  variables: {
    colorBackground: '#18181b',
    colorInputBackground: '#09090b',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa',
    colorPrimary: '#6366f1',
    colorDanger: '#f472b6',
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'mx-auto w-full max-w-md',
    card: 'border border-white/[0.08] bg-surface shadow-card',
    headerTitle: 'text-white',
    headerSubtitle: 'text-zinc-500',
    socialButtonsBlockButton: 'border border-white/[0.08] bg-background text-white',
    formFieldInput: 'border border-white/[0.08] bg-background text-white',
    footerActionLink: 'text-primary hover:text-primary-hover',
  },
} as const

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" appearance={clerkAppearance} />
    </div>
  )
}
