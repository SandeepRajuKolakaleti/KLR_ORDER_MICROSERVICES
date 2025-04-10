import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateOrderDto {
    @IsString()
    OrderNumber!: string;
    
    @IsNumber()
    CustomerId!: number;

    @IsString()
    OrderDate!: Date;

    @IsNumber()
    TotalAmount!: number;

    @IsString()
    Status!: string;

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

    Items!: ProductItemDto[];

    Customer!: CustomerDto;

}

export class UpdateOrderDto extends CreateOrderDto {
    @IsNumber()
    Id?: number;
}

export class ProductItemDto {
    Id!: number;
    ProductId!: number;
    Quantity!: number;
    UnitPrice!: number;
    Order!: CreateOrderDto;
}

export class CustomerDto {
    Id!: number;
    Name!: string;
    Email!: string;
    Phone!: string;
    Address!: string;
    Orders!: CreateOrderDto[]
}