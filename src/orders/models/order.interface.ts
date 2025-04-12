export interface OrderI {
    Id?: number;
    OrderNumber: string; // Unique order reference
    OrderDate: Date;
    TotalAmount: number;
    Status: string;
    PaymentMethod: string;
    IsPaid: boolean;
    PaidAt: Date;
    ShippingAddress?: string;
    BillingAddress?: string;
    Notes: string;
    Items: OrderItemEntity[];
    UserId: number;
}

export interface OrderItemEntity {
    Id: number;
    ProductId: number;
    Quantity: number;
    UnitPrice: number;
}

// export interface CustomerEntity {
//     Id: number;
//     Name: string;
//     Email: string;
//     Phone: string;
//     Address: string;
// }