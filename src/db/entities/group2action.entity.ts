import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group2action')
export class Group2ActionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvGroup2ActionID: number;

  @Column({ type: 'int', nullable: false })
  pvGroupID: number;

  @Column({ type: 'int', nullable: false })
  pvActionID: number;

  @Column({ type: 'varchar', nullable: true })
  pvGroupName: string;

  @Column({ type: 'varchar', nullable: true })
  pvActionStatus: string;

  @Column({ type: 'int', nullable: false })
  pvServiceID: number;

  @Column({ type: 'varchar', nullable: true })
  pvServiceName: string;

  @Column({ type: 'tinyint', nullable: false, default: 0 })
  pvDomainID: number;

  @Column({ type: 'tinyint', nullable: false, default: 0 })
  pvVoid: number;
}
