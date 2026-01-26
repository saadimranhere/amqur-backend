-- CreateEnum
CREATE TYPE "InventoryFeedType" AS ENUM ('XML', 'JSON', 'CSV');

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "inventoryFeedType" "InventoryFeedType",
ADD COLUMN     "inventoryFeedUrl" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);
