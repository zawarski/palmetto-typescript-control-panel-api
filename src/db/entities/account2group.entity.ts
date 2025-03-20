import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account2group')
export class Account2GroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvAccount2GroupID: number;

  @Column({ type: 'int', nullable: true })
  pvAccountID: number;

  @Column({ type: 'tinyint', nullable: true })
  pvGroupAdmin: number;

  @Column({ type: 'int', nullable: true })
  pvGroupID: number;

  @Column({ type: 'tinyint', default: 0 })
  pvVoid: number;

  @Column({ type: 'int', default: 0 })
  pvDomainID: number;

  @Column({ type: 'int', nullable: true })
  pvUserID: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  pvGlobalID: string;

  @Column({ type: 'int', default: 0 })
  pvServiceID: number;

  @Column({ type: 'datetime', nullable: true })
  pvEntryDate: string;
}
