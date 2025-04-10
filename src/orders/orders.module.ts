import { Module } from '@nestjs/common';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './models/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity])
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
