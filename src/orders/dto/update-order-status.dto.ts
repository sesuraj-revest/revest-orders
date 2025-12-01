import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

// Allowed statuses – same as in DB
export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'CANCELLED',
    enum: ORDER_STATUSES,
    description: 'New status for the order',
  })
  @IsIn(ORDER_STATUSES)
  status: OrderStatus;
}
