/**
 * Generic, reusable hooks with no ties to a specific feature or layout
 * component. `use-active-section` is NOT here — it's ScrollSpy plumbing
 * used exclusively by the Navbar and lives colocated with it at
 * `src/components/layout/navbar/use-active-section.ts`.
 */
export * from './use-magnetic'
export * from './use-mouse-parallax'
export * from './use-gsap-reveal'
export * from './use-media-query'
