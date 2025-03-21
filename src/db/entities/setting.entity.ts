import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('setting')
export class SettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  pvSettingID: number;

  @Column({ type: 'int', nullable: true })
  pvAccountID: number;

  @Column({ type: 'varchar', length: 127, nullable: true })
  pvSettingType: string;

  @Column({ type: 'text', nullable: true })
  pvSettingValue: string;

  @Column({ type: 'tinyint', default: 0, nullable: true })
  pvVoid: number;

  @Column({ type: 'datetime', nullable: true })
  pvEntryDate: Date;

  @Column({ type: 'tinyint', default: 0, nullable: true })
  pvGlobalSetting: number;

  @Column({ type: 'int', nullable: true })
  pvGroupID: number;
}
