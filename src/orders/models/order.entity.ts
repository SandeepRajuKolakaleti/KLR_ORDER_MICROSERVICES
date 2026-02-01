import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

// @Entity()
// export class CustomerEntity {

//     @PrimaryGeneratedColumn()
//     Id!: number;

//     @Column()
//     Name!: string;

//     @Column({ unique: true })
//     Email!: string;

//     @Column({ nullable: true })
//     Phone?: string;

//     @Column({ nullable: true })
//     Address?: string;

// }

@Entity()
export class OrderEntity {

    @PrimaryGeneratedColumn()
    Id!: number;

    @Column({ unique: true })
    OrderNumber!: string;

    @Column({ type: 'timestamp' })
    OrderDate!: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    TotalAmount!: number;

    @Column({
        type: "tinyint",
        width: 1,
        default: 1,  // active by default
    })
    isActive!: number;

    @Column({ type: 'enum', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' })
    Status!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    TransactionId?: string;

    @Column({ type: 'enum', enum: ['RazorPay', 'PayPal', 'CashOnDelivery', 'BankTransfer'], default: 'RazorPay' })
    PaymentMethod!: string;

    @Column({ type: 'boolean', default: false })
    IsPaid!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    PaidAt!: Date;

    @Column({ type: 'text', nullable: true })
    ShippingAddress?: string;

    @Column({ type: 'text', nullable: true })
    BillingAddress?: string;

    @Column({ type: 'text', nullable: true })
    Notes!: string;

    @Column({ type: 'text', nullable: true })
    PhoneNumber?: string;

    @Column({ type: 'text', nullable: true })
    Email?: string;

    @OneToMany(() => OrderItemEntity, (product) => product.Order, { cascade: true, eager: true })
    Items!: OrderItemEntity[];

    @Column()
    UserId!: number;

    @Column()
    UserName!: string;

    @Column({ nullable: true })
    DeliveryBoyId?: number;
}

@Entity()
export class OrderItemEntity {

    @PrimaryGeneratedColumn()
    Id!: number;

    @Column()
    ProductId!: number;

    @Column()
    Quantity!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    UnitPrice!: number;

    @Column({ type: 'text', nullable: true })
    VendorId!: string;

    @ManyToOne(() => OrderEntity, order => order.Items, { onDelete: 'CASCADE' })
    Order!: OrderEntity;
}