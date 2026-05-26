/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `History` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "History_userId_key" ON "History"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_userId_key" ON "Message"("userId");
