/*
  Warnings:

  - Added the required column `pseudo` to the `Division` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Division` ADD COLUMN `pseudo` VARCHAR(191) NOT NULL;
