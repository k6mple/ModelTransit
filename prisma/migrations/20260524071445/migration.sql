-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);
