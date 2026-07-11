-- Optional hero interest cards visibility (default true preserves existing sites).

ALTER TABLE "Hero" ADD COLUMN "showInterestCards" BOOLEAN NOT NULL DEFAULT true;
