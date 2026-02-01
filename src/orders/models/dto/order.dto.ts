import { IsArray, IsBoolean, IsEmail, IsNumber, IsString } from "class-validator";

export class CreateOrderDto {

    @IsString()
    OrderDate!: Date;

    @IsNumber()
    TotalAmount!: number;

    @IsString()
    Status!: string;

    @IsNumber()
    isActive!: number;

    TransactionId?: string;

    @IsString()
    PaymentMethod!: string;

    @IsBoolean()
    IsPaid!: boolean;

    @IsString()
    PaidAt!: Date;

    ShippingAddress?: string;
    BillingAddress?: string;

    @IsString()
    Notes!: string;

    @IsString()
    PhoneNumber!: string;

    @IsEmail()
    Email!: string;

    Items!: OrderItemDto[];

    UserId!: number;
    UserName?: string;

    DeliveryBoyId?: number;

}

export class UpdateOrderDto extends CreateOrderDto {
    @IsNumber()
    Id?: number;

    @IsString()
    OrderNumber!: string;
}

export class OrderItemDto {
    Id!: number;
    ProductId!: number;
    Quantity!: number;
    UnitPrice!: number;
    VendorId?: string;
}

// export class CustomerDto {
//     Id!: number;
//     Name!: string;
//     Email!: string;
//     Phone!: string;
//     Address!: string;
// }