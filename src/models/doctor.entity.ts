import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { DoctorSchedule } from './doctor-schedule.entity';
import { BlockedTime } from './blocked-time.entity';
import { Appointment } from './appointment.entity';
import { Speciality } from './speciality.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column({ unique: true, type: 'varchar', length: 20 })
  crm: string;

  @Column({ type: 'uuid' })
  speciality_id: string;

  @ManyToOne(() => Speciality, speciality => speciality.doctors, { eager: true })
  @JoinColumn({ name: 'speciality_id' })
  speciality: Speciality;

  @Column({ nullable: true, type: 'text' })
  professional_statement: string;

  @Column({ default: 30, type: 'integer' })
  consultation_duration: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

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