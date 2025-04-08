import { Module } from '@nestjs/common';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([])
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
