-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Bot',
    "color" TEXT NOT NULL DEFAULT 'blue-600',
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "systemPrompt" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Agent" ("avatarUrl", "createdAt", "description", "id", "isActive", "name", "organizationId", "role", "systemPrompt", "updatedAt") SELECT "avatarUrl", "createdAt", "description", "id", "isActive", "name", "organizationId", "role", "systemPrompt", "updatedAt" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
CREATE INDEX "Agent_organizationId_idx" ON "Agent"("organizationId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
