/*
  Warnings:

  - You are about to drop the column `userId` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "History_userId_key";

-- DropIndex
DROP INDEX "Message_userId_key";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "userId";
