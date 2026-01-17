import { Module } from '@nestjs/common';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './models/order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUES, RABBITMQ_URL } from '../orders/shared/rabbitmq.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [RABBITMQ_URL],
          queue: QUEUES.ORDERS,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
