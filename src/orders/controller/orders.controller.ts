import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto, UpdateOrderDto } from '../models/dto/order.dto';
import { firstValueFrom, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OrderI } from '../models/order.interface';
import { UserI } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { SignedInUserInterceptor } from '../service/signed-in-user.interceptor.service';
import { Request } from 'express';
import { RedisCacheService } from '../service/redis/redis.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
@UseInterceptors(SignedInUserInterceptor)
export class OrdersController {
    constructor(private readonly orderService: OrdersService, private userService: UserService, private redisCacheService: RedisCacheService) {}

    @Post("create-order")
    async createCategory(@Body() createdOrderDto: CreateOrderDto, @Req() request: Request) {
        const userId = createdOrderDto.UserId.toString();
        const authHeader = request.headers['authorization'];
        const token: any = authHeader?.split(' ')[1];
        console.log('JWT Token:', token);
        this.redisCacheService.set("localtoken", token);
        // ✅ Correct Observable → Promise conversion
        const user = await this.userService.findUserById(userId);
        const userData = (await firstValueFrom(user)).data;
        if (!userData) {
            console.log('User Data:', userData);
            throw new Error('User not found');
        }
        console.log('User Data:', userData);
        createdOrderDto.UserName = userData.name;
        return this.orderService.create(createdOrderDto);

    }

    @Get("getAll")
    async getAllOrders( @Req() request: Request, 
            @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
            @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,) {
        return this.orderService.getAll({
            offset: Number(offset),
            limit: Number(limit)
        });
    }

    @Post('update-order')
    async updateOrder(@Body() updatedCategoryDto: UpdateOrderDto): Promise<Observable<OrderI>> {
        return this.orderService.update(updatedCategoryDto);
        // AppConstants.app.xyz
    }

    @Get('order/:id')
    async info(@Param('id') id: number): Promise<any> {
        return this.orderService.findOne(id);
    }

    @Delete('order/:id')
    async deleteOrder(@Param('id') id: number): Promise<any> {
        return this.orderService.delete(id);
    }

    @Get('vendor/:vendorId')
    getVendorOrders(
    @Param('vendorId') vendorId: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    ) {
        return this.orderService.getOrdersByVendorId(
            vendorId,
            offset,
            limit,
        );
    }

}
