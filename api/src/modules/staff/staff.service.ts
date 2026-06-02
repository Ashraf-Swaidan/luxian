import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ALL_PERMISSIONS,
  DEFAULT_STAFF_ROLE_PRESETS,
  PERMISSION_LABELS,
  type Permission,
} from '../auth/permissions/permission.registry';
import { CreateStaffRoleDto } from './dto/create-staff-role.dto';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';

@Injectable()
export class StaffService {
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  listPermissions() {
    return ALL_PERMISSIONS.map((key) => ({
      key,
      label: PERMISSION_LABELS[key],
    }));
  }

  async listRoles() {
    return this.prisma.staffRole.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });
  }

  async createRole(dto: CreateStaffRoleDto) {
    const slug = dto.slug.trim().toLowerCase();
    const existing = await this.prisma.staffRole.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Role slug already exists');
    }

    this.assertValidPermissions(dto.permissions);

    return this.prisma.staffRole.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        permissions: {
          create: dto.permissions.map((permission) => ({ permission })),
        },
      },
      include: { permissions: true },
    });
  }

  async updateRole(id: string, dto: UpdateStaffRoleDto) {
    const role = await this.prisma.staffRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.permissions) {
      this.assertValidPermissions(dto.permissions);
    }

    if (dto.slug && dto.slug !== role.slug) {
      const conflict = await this.prisma.staffRole.findUnique({
        where: { slug: dto.slug.trim().toLowerCase() },
      });
      if (conflict) {
        throw new ConflictException('Role slug already exists');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.permissions) {
        await tx.staffRolePermission.deleteMany({ where: { roleId: id } });
        await tx.staffRolePermission.createMany({
          data: dto.permissions.map((permission) => ({
            roleId: id,
            permission,
          })),
        });
      }

      return tx.staffRole.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.slug !== undefined
            ? { slug: dto.slug.trim().toLowerCase() }
            : {}),
          ...(dto.description !== undefined
            ? { description: dto.description?.trim() ?? null }
            : {}),
        },
        include: { permissions: true },
      });
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.staffRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    if (role._count.users > 0) {
      throw new BadRequestException('Role is assigned to staff users');
    }

    await this.prisma.staffRole.delete({ where: { id } });
    return { message: 'Role deleted' };
  }

  async listStaffUsers() {
    return this.prisma.user.findMany({
      where: { role: Role.STAFF },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStaffActive: true,
        staffRoleId: true,
        staffRole: { select: { id: true, name: true, slug: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaffUser(dto: CreateStaffUserDto) {
    const role = await this.prisma.staffRole.findUnique({
      where: { id: dto.staffRoleId },
    });
    if (!role) {
      throw new NotFoundException('Staff role not found');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const password = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        password,
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        role: Role.STAFF,
        staffRoleId: dto.staffRoleId,
        isStaffActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStaffActive: true,
        staffRoleId: true,
        staffRole: { select: { id: true, name: true, slug: true } },
        createdAt: true,
      },
    });
  }

  async updateStaffUser(id: string, dto: UpdateStaffUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.STAFF },
    });
    if (!user) {
      throw new NotFoundException('Staff user not found');
    }

    if (dto.staffRoleId) {
      const role = await this.prisma.staffRole.findUnique({
        where: { id: dto.staffRoleId },
      });
      if (!role) {
        throw new NotFoundException('Staff role not found');
      }
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, this.SALT_ROUNDS)
      : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName?.trim() } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName?.trim() } : {}),
        ...(dto.staffRoleId !== undefined ? { staffRoleId: dto.staffRoleId } : {}),
        ...(dto.isStaffActive !== undefined
          ? { isStaffActive: dto.isStaffActive }
          : {}),
        ...(passwordHash ? { password: passwordHash } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStaffActive: true,
        staffRoleId: true,
        staffRole: { select: { id: true, name: true, slug: true } },
        createdAt: true,
      },
    });
  }

  async seedDefaultRoles() {
    for (const preset of DEFAULT_STAFF_ROLE_PRESETS) {
      await this.prisma.staffRole.upsert({
        where: { slug: preset.slug },
        update: {
          name: preset.name,
          description: preset.description,
          isSystem: true,
        },
        create: {
          name: preset.name,
          slug: preset.slug,
          description: preset.description,
          isSystem: true,
          permissions: {
            create: preset.permissions.map((permission) => ({ permission })),
          },
        },
      });
    }
  }

  private assertValidPermissions(permissions: string[]) {
    const invalid = permissions.filter(
      (p) => !ALL_PERMISSIONS.includes(p as Permission),
    );
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid permissions: ${invalid.join(', ')}`);
    }
  }
}
