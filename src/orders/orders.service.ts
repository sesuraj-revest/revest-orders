import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { KNEX_CONNECTION } from '../database/knex.tokens';
import { Knex } from 'knex';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './types/order.type';
import { OrderItem } from './types/order-item.type';
import {
  OrderStatus,
  UpdateOrderStatusDto,
} from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  private readonly ordersTable = 'orders';
  private readonly orderItemsTable = 'order_items';
  private readonly productServiceBaseUrl =
    process.env.PRODUCT_SERVICE_BASE_URL || 'http://localhost:3001/api';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly http: HttpService,
  ) {}

  private async fetchProductInternal(
    productId: string,
    countryCode: string,
  ): Promise<{
    id: string;
    sku: string;
    name: string;
    basePrice: number;
    currencyCode: string;
    hsnCode: string;
    hsnShortDescription?: string | null;
    tax: { taxName: string; taxRate: number } | null;
  }> {
    const url = `${this.productServiceBaseUrl}/products/internal/${productId}?country=${countryCode}`;
    const res$ = this.http.get(url);
    const { data }: any = await firstValueFrom(res$);
    return data;
  }

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{ order: Order; items: OrderItem[] }> {
    if (!dto.items || dto.items.length === 0) {
      throw new UnauthorizedException('Order must contain at least one item');
    }

    const countryCode = dto.countryCode.toUpperCase();

    return this.knex.transaction(async (trx) => {
      let subtotal = 0;
      let taxTotal = 0;

      const orderId = trx.raw('gen_random_uuid()');

      const orderItemsToInsert: any[] = [];

      for (const item of dto.items) {
        const product = await this.fetchProductInternal(
          item.productId,
          countryCode,
        );

        const unitPrice = product.basePrice;
        const qty = item.quantity;
        const baseLine = unitPrice * qty;

        const taxRate = product.tax?.taxRate ?? 0;
        const taxAmount = (baseLine * taxRate) / 100;
        const lineTotal = baseLine + taxAmount;

        subtotal += baseLine;
        taxTotal += taxAmount;

        orderItemsToInsert.push({
          id: trx.raw('gen_random_uuid()'),
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          hsn_code: product.hsnCode,
          quantity: qty,
          unit_price: unitPrice,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          line_total: lineTotal,
          created_at: trx.fn.now(),
        });
      }

      const grandTotal = subtotal + taxTotal;

      const [order] = await trx<Order>(this.ordersTable).insert(
        {
          id: orderId,
          user_id: userId,
          country_code: countryCode,
          status: 'PENDING',
          subtotal: subtotal,
          tax_total: taxTotal,
          grand_total: grandTotal,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        },
        '*',
      );

      const items = await trx<OrderItem>(this.orderItemsTable).insert(
        orderItemsToInsert,
        '*',
      );

      return { order, items };
    });
  }

  async findAllForUser(userId: string): Promise<any[]> {
    const orders = await this.knex<Order>(this.ordersTable)
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    const orderIds = orders.map((o) => o.id);

    const items = await this.knex<OrderItem>(this.orderItemsTable).whereIn(
      'order_id',
      orderIds,
    );

    const itemsByOrder: Record<string, OrderItem[]> = {};
    for (const item of items as any) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    return orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] ?? [],
    }));
  }

  async findOneForUser(orderId: string, userId: string): Promise<any> {
    const order = await this.knex<Order>(this.ordersTable)
      .where({ id: orderId, user_id: userId })
      .first();

    if (!order) return null;

    const items = await this.knex<OrderItem>(this.orderItemsTable).where({
      order_id: orderId,
    });

    return { ...order, items };
  }
  async updateStatus(
    orderId: string,
    userId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const newStatus: OrderStatus = dto.status;

    // Optionally enforce simple transitions (PENDING → CONFIRMED/CANCELLED, etc.)
    const order = await this.knex<Order>(this.ordersTable)
      .where({ id: orderId })
      .first();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user_id !== userId) {
      throw new ForbiddenException('You cannot modify this order');
    }

    const [updated] = await this.knex<Order>(this.ordersTable)
      .where({ id: orderId })
      .update(
        {
          status: newStatus,
          updated_at: this.knex.fn.now(),
        },
        '*',
      );

    return updated;
  }
}

// inside OrdersService class
