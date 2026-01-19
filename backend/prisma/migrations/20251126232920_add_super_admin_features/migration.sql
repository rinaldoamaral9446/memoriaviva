-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiUsage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0.0,
    "model" TEXT NOT NULL,
    CONSTRAINT "AiUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#4B0082',
    "secondaryColor" TEXT NOT NULL DEFAULT '#D4AF37',
    "config" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "storageLimit" INTEGER NOT NULL DEFAULT 5,
    "userLimit" INTEGER NOT NULL DEFAULT 10,
    "aiTokenLimit" INTEGER NOT NULL DEFAULT 100000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Organization" ("config", "createdAt", "domain", "id", "isActive", "logo", "name", "primaryColor", "secondaryColor", "slug", "updatedAt") SELECT "config", "createdAt", "domain", "id", "isActive", "logo", "name", "primaryColor", "secondaryColor", "slug", "updatedAt" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX "Organization_domain_key" ON "Organization"("domain");
CREATE TABLE "new_Memory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "eventDate" DATETIME,
    "location" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "mediaUrl" TEXT,
    "documentUrl" TEXT,
    "audioUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "curationScore" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Memory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Memory" ("aiGenerated", "audioUrl", "category", "content", "createdAt", "description", "eventDate", "id", "location", "mediaUrl", "organizationId", "tags", "title", "updatedAt", "userId") SELECT "aiGenerated", "audioUrl", "category", "content", "createdAt", "description", "eventDate", "id", "location", "mediaUrl", "organizationId", "tags", "title", "updatedAt", "userId" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "AiUsage_organizationId_date_model_key" ON "AiUsage"("organizationId", "date", "model");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");
