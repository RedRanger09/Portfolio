export interface CurrentlyLearning {
  title: string
  items: string[]
}

export interface AboutData {
  /** Eyebrow label above the section title, e.g. "About Me". */
  label: string
  title: string
  /** Supporting line rendered under the title in the section header. */
  subtitle: string
  story: string[]
  currentlyLearning: CurrentlyLearning
  /** Heading above the interest chips, e.g. "Interests". */
  interestsLabel: string
  interests: string[]
}
