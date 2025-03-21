import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('action')
export class ActionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvActionID: number;

  @Column({ type: 'varchar', nullable: true })
  pvActionName: string;

  @Column({ type: 'text', nullable: true })
  pvActionDescription: string;

  @Column({ type: 'int', nullable: true })
  pvServiceID: number;

  @Column({ type: 'tinyint', nullable: true, default: 0 })
  pvVoid: number;

  @Column({ type: 'tinyint', nullable: true, default: 0 })
  pvDomainID: number;
}
