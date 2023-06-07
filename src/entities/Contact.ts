import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

export enum LinkPrecedenceEnum {
    PRIMARY = 'primary',
    SECONDARY = 'secondary'
}

@Entity('Contact')
export class Contact extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 50
    })
    phoneNumber: string;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255
    })
    email: string;

    @ManyToOne(() => Contact, { nullable: true })
    @JoinColumn({ name: 'linkedId' })
    linkedContact: Contact;

    @Column({
        type: "enum",
        enum: LinkPrecedenceEnum,
        default: LinkPrecedenceEnum.PRIMARY
    })
    linkPrecedence: LinkPrecedenceEnum;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
