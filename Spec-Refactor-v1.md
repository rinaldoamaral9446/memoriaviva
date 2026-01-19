# Spec-Refactor-v1: The Safe Path

**Date:** 2026-01-18
**Status:** Approved

## Executive Summary

This document defines the strict requirements for the "Safe Path" refactoring. The goal is to eliminate critical scalability risks (RAM exhaustion) and architectural debt (Controller-Database coupling) before implementing Dynamic Agents.

## 1. Critical Refactoring (Scalability & Architecture)

### 1.1 Upload System (Multer)

**Problem:** Currently uses `MemoryStorage`. A single large file upload can crash the server (OOM).
**Requirement:**

- Switch to `DiskStorage`.
- Target Directory: `./temp` (Must be created if not exists).
- **Cleanup:** Files MUST be deleted from `./temp` after processing (successfully or failed) to prevent disk full scenarios.
- **Affected File:** `backend/config/multer.js` and `backend/controllers/aiController.js`.

### 1.2 Service Layer (Decoupling)

**Problem:** `memoryController.js` communicates directly with Prisma.
**Requirement:**

- Isolate all Database Logic into `backend/services/memoryService.js`.
- Controller MUST ONLY handle HTTP concerns (Request validation, Response formatting).
- Service MUST handle Business Logic (Ownership checks, Data formatting, DB interactions).
- **Strict Rule:** No `prisma.*` calls allowed in `memoryController.js`.

## 2. Feature Preparation: Dynamic Agents

### 2.1 Database Schema

**Problem:** Agents are hardcoded. We need a table to store them.
**Requirement:**

- Create `Agent` model in `schema.prisma`.
- **Multi-tenancy ISOLATION:** The table **MUST** include `organizationId`. Agents created by one org cannot be seen by others (unless marked system-wide, but for now strict isolation is preferred).

**Schema Definition:**

```prisma
model Agent {
  id             Int          @id @default(autoincrement())
  
  // Multi-tenancy Isolation
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  name           String       // e.g., "Roberto"
  role           String       // e.g., "Sales Consultant"
  description    String
  avatarUrl      String?
  
  // The Brain
  systemPrompt   String       @default("") 
  
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}
```

## 3. Implementation Steps (Next Phase)

1. **Environment Setup:** Create `./backend/temp` via `mkdir` and ensure `.gitignore` includes it.
2. **Multer Switch:** Modify `config/multer.js`.
3. **AI Logic Update:** Refactor `aiController.js` to use `req.file.path` and implementing cleanup (`fs.unlink`).
4. **Service Creation:** Create `services/memoryService.js` and migrate logic.
5. **Controller Cleanup:** Refactor `memoryController.js`.
6. **Schema Update:** Add `Agent` model and run `npx prisma migrate dev --name add_agents`.

---
*End of Specification*
