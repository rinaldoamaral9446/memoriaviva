-- ============================================
-- Multi-Tenant Migration
-- Step 1: Create Organization table
-- Step 2: Create default organization
-- Step 3: Migrate existing data
-- Step 4: Add foreign keys
-- ============================================

-- Step 1: Create Organization table
CREATE TABLE "Organization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#4B0082',
    "secondaryColor" TEXT NOT NULL DEFAULT '#D4AF37',
    "config" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX "Organization_domain_key" ON "Organization"("domain");

-- Step 2: Insert default "Demo" organization
INSERT INTO "Organization" ("id", "name", "slug", "domain", "primaryColor", "secondaryColor", "config", "isActive", "createdAt", "updatedAt")
VALUES (
    1,
    'Organização Demo',
    'demo',
    'demo.memoriaviva.com.br',
    '#4B0082',
    '#D4AF37',
    '{"aiInstructions":"Foco em memórias culturais gerais e eventos históricos.","features":["memories","timeline","ai"]}',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 3 & 4: Migrate User table
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing users to Demo organization
INSERT INTO "new_User" ("id", "organizationId", "name", "email", "password", "role", "createdAt", "updatedAt")
SELECT 
    "id",
    1 AS "organizationId",
    COALESCE("name", 'User ' || "id") AS "name",
    "email",
    "password",
    'user' AS "role",
    "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Step 5 & 6: Migrate Memory table
CREATE TABLE "new_Memory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "eventDate" DATETIME,
    "location" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "mediaUrl" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Memory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing memories to Demo organization
-- Map old fields to new schema
INSERT INTO "new_Memory" ("id", "organizationId", "userId", "title", "description", "content", "eventDate", "location", "category", "tags", "mediaUrl", "aiGenerated", "createdAt", "updatedAt")
SELECT 
    "id",
    1 AS "organizationId",
    "userId",
    "title",
    "description",
    COALESCE("description", "title") AS "content", -- Use description as content, fallback to title
    "date" AS "eventDate",
    "location",
    NULL AS "category",
    NULL AS "tags",
    "imageUrl" AS "mediaUrl",
    false AS "aiGenerated",
    "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt"
FROM "Memory";

DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
