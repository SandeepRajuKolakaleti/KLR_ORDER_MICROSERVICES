import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto, UpdateOrderDto } from '../models/dto/order.dto';
import { Observable } from 'rxjs';
import { OrderI } from '../models/order.interface';

@Controller('orders')
export class OrdersController {

    constructor(private orderService: OrdersService) {}
    @UseGuards(JwtAuthGuard)
    @Post("create-order")
    createCategory(@Body() createdOrderDto: CreateOrderDto): Observable<OrderI> {
        return this.orderService.create(createdOrderDto);
        // test app constants - AppConstants.app.xyz
    }

    @UseGuards(JwtAuthGuard)
    @Get("getAll")
    async getAllOrders() {
        return this.orderService.getAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post('update-order')
    async updateOrder(@Body() updatedCategoryDto: UpdateOrderDto): Promise<Observable<OrderI>> {
        return this.orderService.update(updatedCategoryDto);
        // AppConstants.app.xyz
    }

    @UseGuards(JwtAuthGuard)
    @Get('order/:id')
    async info(@Param('id') id: number): Promise<any> {
        return this.orderService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('order/:id')
    async deleteOrder(@Param('id') id: number): Promise<any> {
        return this.orderService.delete(id);
    }
}
