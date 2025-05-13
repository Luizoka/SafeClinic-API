import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { DoctorSchedule } from './doctor-schedule.entity';
import { BlockedTime } from './blocked-time.entity';
import { Appointment } from './appointment.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ unique: true, type: 'varchar', length: 20 })
  crm: string;

  @Column({ type: 'varchar', length: 100 })
  speciality: string;

  @Column({ nullable: true, type: 'text' })
  professional_statement: string;

  @Column({ default: 30, type: 'integer' })
  consultation_duration: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relacionamentos
  @OneToOne(() => User, user => user.doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DoctorSchedule, schedule => schedule.doctor)
  schedules: DoctorSchedule[];

  @OneToMany(() => BlockedTime, blockedTime => blockedTime.doctor)
  blocked_times: BlockedTime[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];
} 