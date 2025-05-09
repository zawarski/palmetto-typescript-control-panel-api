import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group_contact')
export class GroupContactEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvDataID: number;

  @Column({ type: 'tinyint', default: 0 })
  pvVoid: number;

  @Column({ type: 'int', nullable: true })
  pvGroupID: number;

  @Column({ type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  pvEntryDate: Date;

  @Column({ type: 'int', nullable: true })
  pvAccountID: number;

  @Column({ type: 'int', nullable: true })
  pvDomainID: number;

  @Column({ type: 'int', nullable: true })
  pvContactGroupID: number;

  @Column({ type: 'int', nullable: true })
  pvContactAccountID: number;
}
