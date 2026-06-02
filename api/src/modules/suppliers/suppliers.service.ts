import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockMovementType, SupplierOrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierOrderDto } from './dto/update-supplier-order.dto';

const supplierOrderInclude = {
  supplier: true,
  items: {
    include: { product: { include: { category: true } } },
    orderBy: { product: { name: 'asc' as const } },
  },
} satisfies Prisma.SupplierOrderInclude;

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  listSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  async createSupplier(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: this.cleanSupplierInput(dto) });
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    await this.ensureSupplierExists(id);
    return this.prisma.supplier.update({
      where: { id },
      data: this.cleanSupplierInput(dto),
    });
  }

  async deactivateSupplier(id: string) {
    await this.ensureSupplierExists(id);
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }

  listSupplierOrders(status?: SupplierOrderStatus) {
    return this.prisma.supplierOrder.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: supplierOrderInclude,
    });
  }

  async getSupplierOrder(id: string) {
    const order = await this.prisma.supplierOrder.findUnique({
      where: { id },
      include: supplierOrderInclude,
    });
    if (!order) {
      throw new NotFoundException('Supplier order not found');
    }
    return order;
  }

  async createSupplierOrder(dto: CreateSupplierOrderDto) {
    await this.validateSupplierOrderInput(dto);
    return this.prisma.supplierOrder.create({
      data: {
        supplierId: dto.supplierId,
        notes: dto.notes?.trim() || null,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: supplierOrderInclude,
    });
  }

  async updateSupplierOrder(id: string, dto: UpdateSupplierOrderDto) {
    const existing = await this.getSupplierOrder(id);
    if (existing.status !== SupplierOrderStatus.ON_THE_WAY) {
      throw new BadRequestException('Only incoming supplier orders can be edited');
    }
    await this.validateSupplierOrderInput(dto);
    return this.prisma.$transaction(async (tx) => {
      await tx.supplierOrderItem.deleteMany({ where: { supplierOrderId: id } });
      return tx.supplierOrder.update({
        where: { id },
        data: {
          supplierId: dto.supplierId,
          notes: dto.notes?.trim() || null,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
            })),
          },
        },
        include: supplierOrderInclude,
      });
    });
  }

  async receiveSupplierOrder(id: string) {
    const order = await this.getSupplierOrder(id);
    if (order.status !== SupplierOrderStatus.ON_THE_WAY) {
      throw new BadRequestException('Only incoming supplier orders can be received');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            cost: item.unitCost,
          },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            supplierOrderId: id,
            type: StockMovementType.SUPPLIER_RECEIVED,
            quantityDelta: item.quantity,
            note: `Received supplier order ${order.orderNumber}`,
          },
        });
      }

      return tx.supplierOrder.update({
        where: { id },
        data: { status: SupplierOrderStatus.RECEIVED, receivedAt: new Date() },
        include: supplierOrderInclude,
      });
    });
  }

  async cancelSupplierOrder(id: string) {
    const order = await this.getSupplierOrder(id);
    if (order.status !== SupplierOrderStatus.ON_THE_WAY) {
      throw new BadRequestException('Only incoming supplier orders can be cancelled');
    }
    return this.prisma.supplierOrder.update({
      where: { id },
      data: { status: SupplierOrderStatus.CANCELLED, cancelledAt: new Date() },
      include: supplierOrderInclude,
    });
  }

  private cleanSupplierInput<T extends CreateSupplierDto | UpdateSupplierDto>(dto: T) {
    return {
      ...dto,
      name: dto.name?.trim(),
      contactPerson: dto.contactPerson?.trim() || null,
      email: dto.email?.trim() || null,
      phone: dto.phone?.trim() || null,
      notes: dto.notes?.trim() || null,
    };
  }

  private async validateSupplierOrderInput(dto: CreateSupplierOrderDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, isActive: true },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const uniqueProductIds = [...new Set(dto.items.map((item) => item.productId))];
    if (uniqueProductIds.length !== dto.items.length) {
      throw new BadRequestException('Each product can only appear once per supplier order');
    }
    const productCount = await this.prisma.product.count({
      where: { id: { in: uniqueProductIds }, isActive: true },
    });
    if (productCount !== uniqueProductIds.length) {
      throw new NotFoundException('One or more products were not found');
    }
  }

  private async ensureSupplierExists(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
  }
}
