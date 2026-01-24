import { Module } from '@nestjs/common';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './models/order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUES, RABBITMQ_URL } from '../orders/shared/rabbitmq.config';
import { UserService } from './service/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { RedisCacheModule } from './service/redis/redis.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    RedisCacheModule,
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
  providers: [OrdersService, UserService],
})
export class OrdersModule {}
