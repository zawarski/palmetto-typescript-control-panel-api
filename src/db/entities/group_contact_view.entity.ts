import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('group_contact_view')
export class GroupContactViewEntity extends BaseEntity {
  @PrimaryColumn('int')
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

  @Column({ type: 'varchar', nullable: true })
  pvEmail: string;

  @Column({ type: 'varchar', nullable: true })
  pvFirstName: string;

  @Column({ type: 'varchar', nullable: true })
  pvLastName: string;
}
