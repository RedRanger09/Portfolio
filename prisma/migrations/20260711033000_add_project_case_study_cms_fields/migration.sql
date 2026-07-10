-- Additive Project case-study CMS fields: section titles + visibility toggles.
-- Defaults preserve existing public rendering for seeded projects.

ALTER TABLE "Project" ADD COLUMN "heroEyebrow" TEXT;

ALTER TABLE "Project" ADD COLUMN "overviewTitle" TEXT NOT NULL DEFAULT 'Overview';
ALTER TABLE "Project" ADD COLUMN "problemTitle" TEXT NOT NULL DEFAULT 'Problem';
ALTER TABLE "Project" ADD COLUMN "techStackTitle" TEXT NOT NULL DEFAULT 'Tech Stack';
ALTER TABLE "Project" ADD COLUMN "architectureTitle" TEXT NOT NULL DEFAULT 'Architecture';
ALTER TABLE "Project" ADD COLUMN "implementationTitle" TEXT NOT NULL DEFAULT 'Implementation';
ALTER TABLE "Project" ADD COLUMN "challengesTitle" TEXT NOT NULL DEFAULT 'Challenges';
ALTER TABLE "Project" ADD COLUMN "lessonsLearnedTitle" TEXT NOT NULL DEFAULT 'Lessons learned';
ALTER TABLE "Project" ADD COLUMN "futureImprovementsTitle" TEXT NOT NULL DEFAULT 'Future improvements';
ALTER TABLE "Project" ADD COLUMN "galleryTitle" TEXT NOT NULL DEFAULT 'Screenshots';
ALTER TABLE "Project" ADD COLUMN "videoTitle" TEXT NOT NULL DEFAULT 'Demo video';
ALTER TABLE "Project" ADD COLUMN "liveDemoTitle" TEXT NOT NULL DEFAULT 'Live demo';

ALTER TABLE "Project" ADD COLUMN "showOverview" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showProblem" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showTechStack" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showArchitecture" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showImplementation" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showChallenges" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showLessonsLearned" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showFutureImprovements" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showGallery" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showVideo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showLiveDemo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showMetrics" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showArchitectureImage" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "showRagPipelineImage" BOOLEAN NOT NULL DEFAULT true;
