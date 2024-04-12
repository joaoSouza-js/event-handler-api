-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "has_google_login" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "photo" TEXT,
    "password" TEXT
);
INSERT INTO "new_User" ("email", "id", "name", "password", "photo") SELECT "email", "id", "name", "password", "photo" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
