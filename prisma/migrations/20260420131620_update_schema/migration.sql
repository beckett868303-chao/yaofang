/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `visits` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_patients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL DEFAULT '男',
    "phone" TEXT NOT NULL,
    "allergies" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_patients" ("age", "allergies", "createdAt", "id", "name", "phone", "updatedAt") SELECT "age", "allergies", "createdAt", "id", "name", "phone", "updatedAt" FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE TABLE "new_visits" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "visitDate" DATETIME NOT NULL,
    "symptoms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_visits" ("createdAt", "id", "patientId", "updatedAt", "visitDate") SELECT "createdAt", "id", "patientId", "updatedAt", "visitDate" FROM "visits";
DROP TABLE "visits";
ALTER TABLE "new_visits" RENAME TO "visits";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
