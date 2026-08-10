-- Platform completion domains: knowledge, trade, finance, uploads, analytics, voice

-- AlterEnum IntegrationProvider
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'NORMALIZED_INVENTORY_HTTP';
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'OPENAI';
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'WEBSITE_CONTENT';

-- CreateEnum KnowledgeSourceType
CREATE TYPE "KnowledgeSourceType" AS ENUM (
  'MANUAL_ARTICLE',
  'UPLOADED_DOCUMENT',
  'VERIFIED_WEBSITE',
  'DEALERSHIP_POLICY',
  'OEM_INFORMATION',
  'SERVICE_FAQ',
  'FINANCE_FAQ',
  'PARTS_FAQ',
  'HOURS_CONTACT',
  'PROMOTION',
  'INTERNAL_SOP'
);

-- CreateEnum KnowledgeAuthorityLevel
CREATE TYPE "KnowledgeAuthorityLevel" AS ENUM (
  'UNVERIFIED',
  'REVIEWED',
  'APPROVED',
  'AUTHORITATIVE'
);

-- CreateEnum KnowledgeStatus
CREATE TYPE "KnowledgeStatus" AS ENUM (
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'EXPIRED',
  'ARCHIVED',
  'REJECTED'
);

-- CreateEnum KnowledgeVisibility
CREATE TYPE "KnowledgeVisibility" AS ENUM ('CUSTOMER', 'STAFF', 'INTERNAL');

-- CreateEnum TradeRequestStatus
CREATE TYPE "TradeRequestStatus" AS ENUM (
  'REQUESTED',
  'PENDING_STAFF',
  'APPRAISAL_PENDING',
  'QUOTED',
  'ACCEPTED',
  'DECLINED',
  'CLOSED',
  'CANCELLED'
);

-- CreateEnum FinanceRequestStatus
CREATE TYPE "FinanceRequestStatus" AS ENUM (
  'REQUESTED',
  'PENDING_STAFF',
  'ESTIMATE_SHARED',
  'HANDED_OFF',
  'CLOSED',
  'CANCELLED'
);

-- CreateEnum FilePurpose
CREATE TYPE "FilePurpose" AS ENUM (
  'TRADE_PHOTO',
  'SERVICE_PHOTO',
  'DOCUMENT',
  'KNOWLEDGE_UPLOAD',
  'OTHER'
);

-- CreateEnum FileScanStatus
CREATE TYPE "FileScanStatus" AS ENUM (
  'PENDING',
  'CLEAN',
  'REJECTED',
  'SKIPPED',
  'ERROR'
);

-- CreateTable KnowledgeSource
CREATE TABLE IF NOT EXISTS "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "sourceType" "KnowledgeSourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "authorityLevel" "KnowledgeAuthorityLevel" NOT NULL DEFAULT 'UNVERIFIED',
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "KnowledgeSource_tenantId_status_idx" ON "KnowledgeSource"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "KnowledgeSource_tenantId_locationId_idx" ON "KnowledgeSource"("tenantId", "locationId");

ALTER TABLE "KnowledgeSource"
  DROP CONSTRAINT IF EXISTS "KnowledgeSource_tenantId_fkey";
ALTER TABLE "KnowledgeSource"
  ADD CONSTRAINT "KnowledgeSource_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KnowledgeSource"
  DROP CONSTRAINT IF EXISTS "KnowledgeSource_locationId_fkey";
ALTER TABLE "KnowledgeSource"
  ADD CONSTRAINT "KnowledgeSource_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable KnowledgeDocument
CREATE TABLE IF NOT EXISTS "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "sourceId" TEXT,
    "title" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "content" TEXT NOT NULL,
    "contentChecksum" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "KnowledgeVisibility" NOT NULL DEFAULT 'CUSTOMER',
    "effectiveAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "KnowledgeDocument_tenantId_status_visibility_idx" ON "KnowledgeDocument"("tenantId", "status", "visibility");
CREATE INDEX IF NOT EXISTS "KnowledgeDocument_tenantId_locationId_idx" ON "KnowledgeDocument"("tenantId", "locationId");
CREATE INDEX IF NOT EXISTS "KnowledgeDocument_tenantId_contentChecksum_idx" ON "KnowledgeDocument"("tenantId", "contentChecksum");

ALTER TABLE "KnowledgeDocument"
  DROP CONSTRAINT IF EXISTS "KnowledgeDocument_tenantId_fkey";
ALTER TABLE "KnowledgeDocument"
  ADD CONSTRAINT "KnowledgeDocument_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KnowledgeDocument"
  DROP CONSTRAINT IF EXISTS "KnowledgeDocument_locationId_fkey";
ALTER TABLE "KnowledgeDocument"
  ADD CONSTRAINT "KnowledgeDocument_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "KnowledgeDocument"
  DROP CONSTRAINT IF EXISTS "KnowledgeDocument_sourceId_fkey";
ALTER TABLE "KnowledgeDocument"
  ADD CONSTRAINT "KnowledgeDocument_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable KnowledgeChunk
CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "locationId" TEXT,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB,
    "embeddingModel" TEXT,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeChunk_documentId_chunkIndex_key" ON "KnowledgeChunk"("documentId", "chunkIndex");
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_tenantId_locationId_idx" ON "KnowledgeChunk"("tenantId", "locationId");
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_tenantId_documentId_idx" ON "KnowledgeChunk"("tenantId", "documentId");

ALTER TABLE "KnowledgeChunk"
  DROP CONSTRAINT IF EXISTS "KnowledgeChunk_documentId_fkey";
ALTER TABLE "KnowledgeChunk"
  ADD CONSTRAINT "KnowledgeChunk_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable WebsiteAllowedDomain
CREATE TABLE IF NOT EXISTS "WebsiteAllowedDomain" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "hostname" TEXT NOT NULL,
    "pathPrefix" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteAllowedDomain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WebsiteAllowedDomain_tenantId_hostname_key" ON "WebsiteAllowedDomain"("tenantId", "hostname");
CREATE INDEX IF NOT EXISTS "WebsiteAllowedDomain_tenantId_enabled_idx" ON "WebsiteAllowedDomain"("tenantId", "enabled");

ALTER TABLE "WebsiteAllowedDomain"
  DROP CONSTRAINT IF EXISTS "WebsiteAllowedDomain_tenantId_fkey";
ALTER TABLE "WebsiteAllowedDomain"
  ADD CONSTRAINT "WebsiteAllowedDomain_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WebsiteAllowedDomain"
  DROP CONSTRAINT IF EXISTS "WebsiteAllowedDomain_locationId_fkey";
ALTER TABLE "WebsiteAllowedDomain"
  ADD CONSTRAINT "WebsiteAllowedDomain_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable TradeRequest
CREATE TABLE IF NOT EXISTS "TradeRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "conversationId" TEXT,
    "vin" TEXT,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "mileage" INTEGER,
    "condition" TEXT,
    "payoffAmount" DOUBLE PRECISION,
    "ownership" TEXT,
    "desiredVehicleVin" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "notes" TEXT,
    "appraisalVerified" BOOLEAN NOT NULL DEFAULT false,
    "appraisalValue" DOUBLE PRECISION,
    "status" "TradeRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "photoFileIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TradeRequest_tenantId_status_idx" ON "TradeRequest"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "TradeRequest_tenantId_conversationId_idx" ON "TradeRequest"("tenantId", "conversationId");

ALTER TABLE "TradeRequest"
  DROP CONSTRAINT IF EXISTS "TradeRequest_tenantId_fkey";
ALTER TABLE "TradeRequest"
  ADD CONSTRAINT "TradeRequest_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TradeRequest"
  DROP CONSTRAINT IF EXISTS "TradeRequest_locationId_fkey";
ALTER TABLE "TradeRequest"
  ADD CONSTRAINT "TradeRequest_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable FinanceRequest
CREATE TABLE IF NOT EXISTS "FinanceRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "conversationId" TEXT,
    "vehicleVin" TEXT,
    "desiredPayment" DOUBLE PRECISION,
    "downPayment" DOUBLE PRECISION,
    "termMonths" INTEGER,
    "leaseOrPurchase" TEXT,
    "tradeInterest" BOOLEAN NOT NULL DEFAULT false,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "aprProvided" DOUBLE PRECISION,
    "status" "FinanceRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FinanceRequest_tenantId_status_idx" ON "FinanceRequest"("tenantId", "status");

ALTER TABLE "FinanceRequest"
  DROP CONSTRAINT IF EXISTS "FinanceRequest_tenantId_fkey";
ALTER TABLE "FinanceRequest"
  ADD CONSTRAINT "FinanceRequest_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FinanceRequest"
  DROP CONSTRAINT IF EXISTS "FinanceRequest_locationId_fkey";
ALTER TABLE "FinanceRequest"
  ADD CONSTRAINT "FinanceRequest_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable FileObject
CREATE TABLE IF NOT EXISTS "FileObject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "purpose" "FilePurpose" NOT NULL,
    "scannedStatus" "FileScanStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedByUserId" TEXT,
    "conversationId" TEXT,
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileObject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FileObject_tenantId_storageKey_key" ON "FileObject"("tenantId", "storageKey");
CREATE INDEX IF NOT EXISTS "FileObject_tenantId_purpose_idx" ON "FileObject"("tenantId", "purpose");
CREATE INDEX IF NOT EXISTS "FileObject_tenantId_conversationId_idx" ON "FileObject"("tenantId", "conversationId");

ALTER TABLE "FileObject"
  DROP CONSTRAINT IF EXISTS "FileObject_tenantId_fkey";
ALTER TABLE "FileObject"
  ADD CONSTRAINT "FileObject_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FileObject"
  DROP CONSTRAINT IF EXISTS "FileObject_locationId_fkey";
ALTER TABLE "FileObject"
  ADD CONSTRAINT "FileObject_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable AnalyticsEvent
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "eventType" TEXT NOT NULL,
    "properties" JSONB,
    "conversationExternalKey" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_tenantId_eventType_occurredAt_idx" ON "AnalyticsEvent"("tenantId", "eventType", "occurredAt");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_tenantId_locationId_occurredAt_idx" ON "AnalyticsEvent"("tenantId", "locationId", "occurredAt");

ALTER TABLE "AnalyticsEvent"
  DROP CONSTRAINT IF EXISTS "AnalyticsEvent_tenantId_fkey";
ALTER TABLE "AnalyticsEvent"
  ADD CONSTRAINT "AnalyticsEvent_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnalyticsEvent"
  DROP CONSTRAINT IF EXISTS "AnalyticsEvent_locationId_fkey";
ALTER TABLE "AnalyticsEvent"
  ADD CONSTRAINT "AnalyticsEvent_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable VoiceCallSession
CREATE TABLE IF NOT EXISTS "VoiceCallSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT,
    "externalCallId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "fromNumber" TEXT,
    "toNumber" TEXT,
    "recordingConsent" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT,
    "conversationExternalKey" TEXT,
    "leadId" TEXT,
    "escalationId" TEXT,
    "summary" TEXT,
    "metadata" JSONB,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceCallSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VoiceCallSession_tenantId_externalCallId_key" ON "VoiceCallSession"("tenantId", "externalCallId");
CREATE INDEX IF NOT EXISTS "VoiceCallSession_tenantId_state_idx" ON "VoiceCallSession"("tenantId", "state");

ALTER TABLE "VoiceCallSession"
  DROP CONSTRAINT IF EXISTS "VoiceCallSession_tenantId_fkey";
ALTER TABLE "VoiceCallSession"
  ADD CONSTRAINT "VoiceCallSession_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceCallSession"
  DROP CONSTRAINT IF EXISTS "VoiceCallSession_locationId_fkey";
ALTER TABLE "VoiceCallSession"
  ADD CONSTRAINT "VoiceCallSession_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
