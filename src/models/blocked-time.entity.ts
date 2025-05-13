import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('blocked_times')
export class BlockedTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctor_id: string;

  @Column({ type: 'timestamp' })
  start_datetime: Date;

  @Column({ type: 'timestamp' })
  end_datetime: Date;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => Doctor, doctor => doctor.blocked_times)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
} 