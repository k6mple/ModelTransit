/*
  Warnings:

  - The primary key for the `History` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `History` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "History" DROP CONSTRAINT "History_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "History_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "History_id_key" ON "History"("id");
