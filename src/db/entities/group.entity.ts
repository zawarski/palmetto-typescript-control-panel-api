import { PrimaryGeneratedColumn, Column, Entity, BaseEntity } from 'typeorm';

@Entity('group')
export class GroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvGroupID: number;

  @Column({ type: 'varchar', nullable: true })
  pvGroupName: string;

  @Column({ type: 'varchar', nullable: true })
  pvGroupTitle: string;

  @Column({ type: 'text', nullable: true })
  pvGroupComment: string;

  @Column({ type: 'tinyint', default: 0 })
  pvVoid: number;

  @Column({ type: 'tinyint', default: 0 })
  pvDomainID: number;

  @Column({ type: 'int', nullable: true })
  pvParentGroupID: number;

  @Column({ type: 'tinyint', default: 0 })
  pvIsAgency: number;
}
