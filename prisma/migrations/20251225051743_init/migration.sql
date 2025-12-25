/*
  Warnings:

  - You are about to drop the column `used` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `organization` table. All the data in the column will be lost.
  - Added the required column `status` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invitation` DROP COLUMN `used`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `organization` DROP COLUMN `updatedAt`;
