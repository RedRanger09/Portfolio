-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('CLOUDINARY', 'LOCAL');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'PDF');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "screenshotMediaId" TEXT;

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "publicId" TEXT,
    "url" TEXT NOT NULL,
    "secureUrl" TEXT,
    "provider" "MediaProvider" NOT NULL DEFAULT 'CLOUDINARY',
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "folder" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "bytes" INTEGER,
    "altText" TEXT,
    "uploadedByEmail" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAttachment" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "attachableType" TEXT NOT NULL,
    "attachableId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_folder_deletedAt_idx" ON "Media"("folder", "deletedAt");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");

-- CreateIndex
CREATE INDEX "Media_provider_idx" ON "Media"("provider");

-- CreateIndex
CREATE INDEX "MediaAttachment_attachableType_attachableId_role_order_idx" ON "MediaAttachment"("attachableType", "attachableId", "role", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAttachment_mediaId_attachableType_attachableId_role_key" ON "MediaAttachment"("mediaId", "attachableType", "attachableId", "role");

-- CreateIndex
CREATE INDEX "Project_screenshotMediaId_idx" ON "Project"("screenshotMediaId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_screenshotMediaId_fkey" FOREIGN KEY ("screenshotMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
