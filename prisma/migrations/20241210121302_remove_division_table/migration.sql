/*
  Warnings:

  - You are about to drop the column `divisionId` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the `Division` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pole` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Staff` DROP FOREIGN KEY `Staff_divisionId_fkey`;

-- AlterTable
ALTER TABLE `Staff` DROP COLUMN `divisionId`,
    ADD COLUMN `pole` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Division`;

-- CreateTable
CREATE TABLE `Area` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffArea` (
    `staffId` VARCHAR(191) NOT NULL,
    `areaId` INTEGER NOT NULL,

    PRIMARY KEY (`staffId`, `areaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StaffArea` ADD CONSTRAINT `StaffArea_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffArea` ADD CONSTRAINT `StaffArea_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
