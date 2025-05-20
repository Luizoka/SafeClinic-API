import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ABSENT = 'absent'
}

export enum AppointmentType {
  ONLINE = 'online',
  PRESENTIAL = 'presential'
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patient_id: string;

  @Column()
  doctor_id: string;

  @Column({ type: 'timestamp' })
  appointment_datetime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: AppointmentType
  })
  type: AppointmentType;

  @Column({ nullable: true })
  symptoms_description: string;

  @Column({ nullable: true })
  medical_notes: string;

  @Column({ nullable: true })
  cancellation_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => Patient, patient => patient.appointments)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'user_id' })
  patient: Patient;

  @ManyToOne(() => Doctor, doctor => doctor.appointments)
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'user_id' })
  doctor: Doctor;
}