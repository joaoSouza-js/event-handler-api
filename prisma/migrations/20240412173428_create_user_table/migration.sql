-- AlterTable
ALTER TABLE "attendees" ADD COLUMN "userId" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AttendeeToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AttendeeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "attendees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AttendeeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "slug" TEXT NOT NULL,
    "maximum_attendee" INTEGER,
    "ownerId" TEXT,
    CONSTRAINT "events_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_events" ("details", "id", "maximum_attendee", "slug", "title") SELECT "details", "id", "maximum_attendee", "slug", "title" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AttendeeToUser_AB_unique" ON "_AttendeeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AttendeeToUser_B_index" ON "_AttendeeToUser"("B");
