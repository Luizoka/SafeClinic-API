import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity({ name: 'specialities' })
export class Speciality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Doctor, doctor => doctor.speciality)
  doctors: Doctor[];
}
