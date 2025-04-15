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

    @Column()
    OrderNumber!: string;

    @Column({ type: 'timestamp' })
    OrderDate!: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    TotalAmount!: number;

    @Column({ type: 'enum', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' })
    Status!: string;

    @Column({ type: 'enum', enum: ['CreditCard', 'PayPal', 'CashOnDelivery', 'BankTransfer'], default: 'CreditCard' })
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

    @OneToMany(() => OrderItemEntity, (product) => product.Order, { cascade: true, eager: true })
    Items!: OrderItemEntity[];

    @Column()
    UserId!: number;
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

    @ManyToOne(() => OrderEntity, order => order.Items, { onDelete: 'CASCADE' })
    Order!: OrderEntity;
}