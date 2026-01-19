-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Memory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "eventDate" DATETIME,
    "isEvent" BOOLEAN NOT NULL DEFAULT false,
    "ticketPrice" REAL,
    "capacity" INTEGER,
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
    "eventId" INTEGER,
    CONSTRAINT "Memory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Memory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Memory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Memory" ("aiGenerated", "audioUrl", "capacity", "category", "content", "createdAt", "curationScore", "description", "documentUrl", "eventDate", "id", "isEvent", "isPublic", "location", "mediaUrl", "organizationId", "tags", "ticketPrice", "title", "updatedAt", "userId") SELECT "aiGenerated", "audioUrl", "capacity", "category", "content", "createdAt", "curationScore", "description", "documentUrl", "eventDate", "id", "isEvent", "isPublic", "location", "mediaUrl", "organizationId", "tags", "ticketPrice", "title", "updatedAt", "userId" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
