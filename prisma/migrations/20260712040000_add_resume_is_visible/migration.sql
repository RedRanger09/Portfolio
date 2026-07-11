-- Resume soft-hide flag (section content remains in CMS when false).
ALTER TABLE "Resume" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
