import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Req,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order for current user' })
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.userId;
    return this.ordersService.createOrder(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders for current user' })
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.ordersService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order with items' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const order = await this.ordersService.findOneForUser(id, userId);
    if (!order) {
      // You can throw NotFoundException instead if you prefer
      return { message: 'Order not found' };
    }
    return order;
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order status (CONFIRMED, CANCELLED, COMPLETED)',
  })
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const userId = req.user.userId;
    return this.ordersService.updateStatus(id, userId, dto);
  }
}
