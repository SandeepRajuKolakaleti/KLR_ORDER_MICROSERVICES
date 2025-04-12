import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../models/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto, UpdateOrderDto } from '../models/dto/order.dto';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { OrderI } from '../models/order.interface';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {}
    create(createdOrderDto: CreateOrderDto) {
        return from(this.orderRepository.save(createdOrderDto)).pipe(
            map((savedOrder: OrderI) => {
                const { ...order } = savedOrder;
                return order;
            })
        )
    }

    getAll() {
        return from(this.orderRepository.find());
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
            ]
        }));
    }

    async delete(Id: number) {
        const category = await this.orderRepository.findOne({ where: { Id } });
        if (category) {
           await this.orderRepository.remove(category);
           return true;
        }
    }
}
