-- Additive visibility flags for SiteSettings + collection soft-hide.
-- All columns default TRUE so existing rows remain publicly visible.

ALTER TABLE "SiteSettings" ADD COLUMN "showHero" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showAbout" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showJourney" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showSkills" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showProjects" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showEducation" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showCertificates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showResume" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showBlog" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showContact" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showContactForm" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "showInterests" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Project" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SkillCategory" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Education" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Certification" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "JourneyMilestone" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BlogPost" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Project_isVisible_idx" ON "Project"("isVisible");
CREATE INDEX "SkillCategory_isVisible_idx" ON "SkillCategory"("isVisible");
CREATE INDEX "Education_isVisible_idx" ON "Education"("isVisible");
CREATE INDEX "Certification_isVisible_idx" ON "Certification"("isVisible");
CREATE INDEX "JourneyMilestone_isVisible_idx" ON "JourneyMilestone"("isVisible");
CREATE INDEX "BlogPost_isVisible_idx" ON "BlogPost"("isVisible");
