-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isStaffActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "staffRoleId" TEXT;

-- CreateTable
CREATE TABLE "staff_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "staff_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_roles_slug_key" ON "staff_roles"("slug");

-- CreateIndex
CREATE INDEX "staff_role_permissions_roleId_idx" ON "staff_role_permissions"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_role_permissions_roleId_permission_key" ON "staff_role_permissions"("roleId", "permission");

-- CreateIndex
CREATE INDEX "users_staffRoleId_idx" ON "users"("staffRoleId");

-- AddForeignKey
ALTER TABLE "staff_role_permissions" ADD CONSTRAINT "staff_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "staff_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_staffRoleId_fkey" FOREIGN KEY ("staffRoleId") REFERENCES "staff_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
