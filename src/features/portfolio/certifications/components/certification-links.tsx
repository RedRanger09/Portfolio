import { BadgeCheck } from 'lucide-react'

interface CertificationLinksProps {
  name: string
  credentialUrl: string
  verifyUrl: string
}

/** Credential / Verify links shown in a certificate's caption. */
export function CertificationLinks({ name, credentialUrl, verifyUrl }: CertificationLinksProps) {
  return (
    <>
      {credentialUrl && (
        <a
          href={credentialUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`View credential for ${name}`}
          className="rounded-full border border-white/[0.08] px-3 py-1 text-[0.7rem] text-cyan-400 transition hover:border-cyan-500/40 hover:text-cyan-300"
        >
          Credential
        </a>
      )}
      {verifyUrl && (
        <a
          href={verifyUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Verify ${name} credential`}
          className="inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[0.7rem] text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verify
        </a>
      )}
    </>
  )
}
