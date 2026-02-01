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
                'Id', 'OrderNumber', 'Status', 'OrderDate', 'TotalAmount', 'IsPaid', 'TransactionId', 'PaidAt', 'PaymentMethod', 'ShippingAddress',
                'Items', 'UserId', 'UserName', 'isActive', 'BillingAddress', 'Notes', 'PhoneNumber', 'Email'
            ],
            skip: pagination.offset,
            take: pagination.limit
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
                'Id', 'OrderNumber', 'Status', 'OrderDate', 'TotalAmount', 'IsPaid', 'TransactionId', 'PaidAt', 'PaymentMethod', 'ShippingAddress',
                'Items', 'UserId', 'UserName', 'isActive', 'BillingAddress', 'Notes', 'PhoneNumber', 'Email', 'DeliveryBoyId'
            ],
            relations: { Items: true}
        }));
    }

    async getOrdersByVendorId(
        vendorId: string,
        offset?: number,
        limit?: number,
    ): Promise<PaginatedResult<OrderI>> {

        const qb = this.orderRepository
            .createQueryBuilder('order')
            .distinct(true)
            .innerJoinAndSelect('order.Items', 'item')
            .where('item.VendorId = :vendorId', { vendorId })
            .orderBy('order.OrderDate', 'DESC');


        if (offset !== undefined && limit !== undefined) {
            qb.skip(offset).take(limit);
        }

        const [data, total] = await qb.getManyAndCount();

        return {
            total,
            offset,
            limit,
            data,
        };
    }

    async getOrdersByDeliveryBoyId(
        deliveryBoyId: string,
        offset?: number,
        limit?: number,
    ): Promise<PaginatedResult<OrderI>> {

        const qb = this.orderRepository
            .createQueryBuilder('order')
            .where('DeliveryBoyId = :deliveryBoyId', { deliveryBoyId })
            .orderBy('order.OrderDate', 'DESC');


        if (offset !== undefined && limit !== undefined) {
            qb.skip(offset).take(limit);
        }

        const [data, total] = await qb.getManyAndCount();

        return {
            total,
            offset,
            limit,
            data,
        };
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
