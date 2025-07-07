-- CreateTable
CREATE TABLE "bonuses" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "helperId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bonuses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bonuses" ADD CONSTRAINT "bonuses_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "helpers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
