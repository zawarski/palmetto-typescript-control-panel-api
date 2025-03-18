import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, UpdateDateColumn } from 'typeorm';

@Entity('group_contact')
export class GroupContactEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvDataID: number;

  @Column({ type: 'tinyint', default: 0 })
  pvVoid: number;

  @Column({ type: 'int', nullable: true })
  pvGroupID: number;

  @UpdateDateColumn()
  pvEntryDate: string;

  @Column({ type: 'int', nullable: true })
  pvAccountID: number;

  @Column({ type: 'int', nullable: true })
  pvDomainID: number;

  @Column({ type: 'int', nullable: true })
  pvContactGroupID: number;

  @Column({ type: 'int', nullable: true })
  pvContactAccountID: number;
}
