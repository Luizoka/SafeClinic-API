import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import path from 'path';
import { User } from '../models/user.entity';
import { Receptionist } from '../models/receptionist.entity';
import { Doctor } from '../models/doctor.entity';
import { Patient } from '../models/patient.entity';
import { Appointment } from '../models/appointment.entity';
import { BlockedTime } from '../models/blocked-time.entity';
import { DoctorSchedule } from '../models/doctor-schedule.entity';
import { Notification } from '../models/notification.entity';
import { Speciality } from '../models/speciality.entity';

dotenv.config();

const getDataSourceConfig = () => {
  if (process.env.DATABASE_URL) {
    logger.info('Usando DATABASE_URL para conexão');
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      synchronize: process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOGGING === 'true' ? 'all' : 'error',
      entities: [
        User,
        Receptionist,
        Doctor,
        Patient,
        Appointment,
        BlockedTime,
        DoctorSchedule,
        Notification,
        Speciality
      ],
      migrations: [path.resolve(__dirname, './migrations/**/*.{ts,js}')],
      subscribers: [__dirname + '/subscribers/*{.ts,.js}']
    };
  }

  logger.info('Usando configuração local para conexão');
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'safeclinic',
    ssl: process.env.DB_HOST?.includes('rlwy.net') ? { rejectUnauthorized: false } : false,
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true' ? 'all' : 'error',
    entities: [
      User,
      Receptionist,
      Doctor,
      Patient,
      Appointment,
      BlockedTime,
      DoctorSchedule,
      Notification,
      Speciality
    ],
    migrations: [path.resolve(__dirname, './migrations/**/*.{ts,js}')],
    subscribers: [__dirname + '/subscribers/*{.ts,.js}']
  };
};

export const AppDataSource = new DataSource(getDataSourceConfig() as any);

export const initializeDB = async (): Promise<void> => {
  try {
    logger.info('Iniciando conexão com o banco de dados...');
    await AppDataSource.initialize();
    logger.info('Conexão com o banco de dados estabelecida com sucesso!');
    logger.info('Verificando migrações pendentes...');
    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      logger.info('Executando migrações pendentes...');
      await AppDataSource.runMigrations();
      logger.info('Migrações executadas com sucesso!');
    } else {
      logger.info('Não há migrações pendentes.');
    }
  } catch (error) {
    logger.error('Erro ao inicializar conexão com o banco de dados:', { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};