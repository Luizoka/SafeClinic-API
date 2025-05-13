import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  health_insurance: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  emergency_contact: string;

  @Column({ nullable: true, type: 'varchar', length: 10 })
  blood_type: string;

  @Column({ nullable: true, type: 'text' })
  allergies: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relacionamentos
  @OneToOne(() => User, user => user.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];
} 