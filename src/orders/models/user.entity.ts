import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({unique: true})
    email!: string;

    @Column({select: false})
    password!: string;

    @Column({select: false})
    permissionId!: number;

    @Column({select: false})
    phonenumber!: number;

    @Column({select: false})
    image!: number;

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}