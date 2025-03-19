import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('service')
export class ServiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvServiceID: number;

  @Column({ type: 'varchar', nullable: true })
  pvServiceName: string;

  @Column({ type: 'text', nullable: true })
  pvServiceDescription: string;

  @Column({ type: 'varchar', nullable: true })
  pvServiceEndPoint: string;

  @Column({ type: 'varchar', nullable: true })
  pvServiceTitle: string;

  @Column({ type: 'tinyint', nullable: true, default: 0 })
  pvVoid: number;

  @Column({ type: 'tinyint', nullable: true, default: 0 })
  pvDomainID: number;

  @Column({ type: 'varchar', nullable: true })
  pvServiceCategory: string;

  @Column({ type: 'text', nullable: true })
  pvDatasources: string;

  @Column({ type: 'text', nullable: true })
  pvFeatures: string;

  @Column({ type: 'int', nullable: true })
  pvParentServiceID: string;
}
