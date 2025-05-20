import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
import { Receptionist } from './receptionist.entity';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole
  })
  role: UserRole;

  @Column()
  name: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  last_login: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @OneToOne(() => Patient, patient => patient.user)
  patient: Patient;

  @OneToOne(() => Doctor, doctor => doctor.user)
  doctor: Doctor;

  @OneToOne(() => Receptionist, receptionist => receptionist.user)
  receptionist: Receptionist;
}