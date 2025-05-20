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
  user_id: string;

  @Column({ type: 'enum', enum: WorkShift })
  work_shift: WorkShift;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => User, user => user.receptionist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}