-- Add new columns to User table for organization approval workflow
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pendingOrganizationId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT false;
