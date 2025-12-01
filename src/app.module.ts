import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, OrdersModule, AuthModule],
})
export class AppModule {}
