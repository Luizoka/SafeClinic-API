import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum WorkShift {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night'
}

@Entity('receptionists')
export class Receptionist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: WorkShift
  })
  work_shift: WorkShift;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @OneToOne(() => User, user => user.receptionist)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 