/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_assignedToId_fkey`;

-- AlterTable
ALTER TABLE `invitation` ADD COLUMN `used` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `organization` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `project` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `task` DROP COLUMN `assignedToId`,
    ADD COLUMN `assignedTo` INTEGER NULL,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
    MODIFY `dueDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Organization_name_key` ON `Organization`(`name`);

-- CreateIndex
CREATE INDEX `Task_assignedTo_idx` ON `Task`(`assignedTo`);

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `project` RENAME INDEX `Project_organizationId_fkey` TO `Project_organizationId_idx`;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_projectId_fkey` TO `Task_projectId_idx`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_organizationId_fkey` TO `User_organizationId_idx`;
