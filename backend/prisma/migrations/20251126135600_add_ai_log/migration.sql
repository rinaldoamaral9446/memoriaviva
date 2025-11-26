-- CreateTable
CREATE TABLE "AiLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inputContext" TEXT,
    "promptUsed" TEXT NOT NULL,
    "aiOutput" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
