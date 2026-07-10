import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Required once the app has more than one root layout (`(site)` and
    // `admin`, added by the Admin Foundation phase) — Next.js can no
    // longer compose one shared "unmatched URL" 404 page from a single
    // root layout, so this opts into the `app/global-not-found.tsx`
    // convention instead. See that file for the full explanation.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
    // Local project placeholder diagrams/screenshots are `.svg` (e.g.
    // `visionforge-screenshot.svg`) — these are self-authored, fully
    // trusted repo assets (not remote/user-uploaded), so allowing SVG
    // optimization here is safe. Without this, `next/image` returns a 400
    // for every local SVG, which was a pre-existing bug: the Projects grid
    // and featured showcase already reference these files.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
}

export default nextConfig
