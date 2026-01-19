import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../models/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto, UpdateOrderDto } from '../models/dto/order.dto';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { OrderI } from '../models/order.interface';
import { AppConstants } from '../../app.constants';
import { ClientProxy } from '@nestjs/microservices';
import { PaginatedResult, Pagination } from '../models/pagination.interface';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @Inject('RABBITMQ_SERVICE')
        private readonly client: ClientProxy
    ) {}
    async create(createdOrderDto: CreateOrderDto) {
        const orderNumber = await this.generateOrderNumber();
        this.client.emit('ORDER_CREATED', {
            orderId: orderNumber,
            amount: createdOrderDto.TotalAmount,
            ...createdOrderDto
        });

        return from(this.orderRepository.save({
            ...createdOrderDto, 
            OrderNumber: orderNumber
        })).pipe(
            map((savedOrder: OrderI) => {
                const { ...order } = savedOrder;
                return order;
            })
        )
    }

    getAll(pagination: Pagination): Observable<PaginatedResult<OrderI>> {
        return from(this.orderRepository.findAndCount({
            select: [
                'Id', 'OrderNumber', 'Status', 'OrderDate', 'TotalAmount', 'IsPaid', 'TransactionId'
            ],
            skip: pagination.offset,
            take: pagination.limit,
            order: { OrderDate: "DESC" }
        })).pipe(
        map(([orders, total]) => ({
            total: total,
            offset: pagination.offset,
            limit: pagination.limit,
            data: orders
        })));
    }

    async update(updatedOrderDto: UpdateOrderDto): Promise<Observable<any>> {
        const Id = updatedOrderDto.Id;
        const order = await this.orderRepository.findOne({ where: { Id: Id } });
        if (order) {
            let orderDto = { ...order,...updatedOrderDto};
            return from(this.orderRepository.upsert(orderDto, ['Id'])).pipe(
                switchMap(() =>
                    from(this.orderRepository.findOne({ where: { Id } })).pipe(
                        map((updatedOrder) => {
                            if (!updatedOrder) {
                                throw new Error('Brand update failed');
                            }
                            return updatedOrder as unknown as OrderI;
                        })
                    )
                )
            );
        } else {
            return of([]);
        }
    }

    findOne(Id: number): Observable<any> {
        return from(this.orderRepository.findOne({
            where: {Id},
            select: [
                'Id', 'OrderNumber', 'Status', 'OrderDate', 'TotalAmount', 'IsPaid'
            ],
            relations: { Items: true}
        }));
    }

    async delete(Id: number) {
        const order = await this.orderRepository.findOne({ where: { Id } });
        if (!order) {
            return false;
        }

        order.isActive = AppConstants.app.status.inactive;
        await this.orderRepository.save(order);

        return true;
    }

    private async generateOrderNumber(): Promise<string> {
        const count = await this.orderRepository.count();

        const nextNumber = count + 1;

        const year = new Date().getFullYear();

        return `ORD-${year}-${String(nextNumber).padStart(6, '0')}`;
    }
}
