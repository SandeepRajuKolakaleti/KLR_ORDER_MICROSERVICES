export interface OrderI {
    Id?: number;
    OrderNumber: string; // Unique order reference
    CustomerId: number; // Link to Customer Entity
    OrderDate: Date;
    TotalAmount: number;
    Status: string;
    PaymentMethod: string;
    IsPaid: boolean;
    PaidAt: Date;
    ShippingAddress?: string;
    BillingAddress?: string;
    Notes: string;
    Items: ProductItemEntity[];
    Customer?: CustomerEntity;
}

export interface ProductItemEntity {
    Id: number;
    ProductId: number;
    Quantity: number;
    UnitPrice: number;
    Order: OrderI;
}

export interface CustomerEntity {
    Id: number;
    Name: string;
    Email: string;
    Phone: string;
    Address: string;
    Orders: OrderI[];
}