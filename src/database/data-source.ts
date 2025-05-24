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

dotenv.config();

// Configuração para permitir tanto DATABASE_URL quanto configurações individuais
const getDataSourceConfig = () => {
  // Se DATABASE_URL estiver definido (para Railway)
  if (process.env.DATABASE_URL) {
    logger.info('Usando DATABASE_URL para conexão');
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      synchronize: process.env.DB_SYNC === 'true',
      // Mostra apenas erros do TypeORM
      logging: 'error',
      entities: [
        User,
        Receptionist,
        Doctor,
        Patient,
        Appointment,
        BlockedTime,
        DoctorSchedule,
        Notification
      ],
      migrations: [path.resolve(__dirname, './migrations/**/*.{ts,js}')],
      subscribers: [__dirname + '/subscribers/*{.ts,.js}']
    };
  }

  // Configuração padrão para desenvolvimento local
  logger.info('Usando configuração local para conexão');
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'safeclinic',
    synchronize: process.env.DB_SYNC === 'true',
    // Mostra apenas erros do TypeORM
    logging: 'error',
    entities: [
      User,
      Receptionist,
      Doctor,
      Patient,
      Appointment,
      BlockedTime,
      DoctorSchedule,
      Notification
    ],
    migrations: [path.resolve(__dirname, './migrations/**/*.{ts,js}')],
    subscribers: [__dirname + '/subscribers/*{.ts,.js}']
  };
};

export const AppDataSource = new DataSource(getDataSourceConfig() as any);

// Função para inicializar a conexão com o banco de dados
export const initializeDB = async (): Promise<void> => {
  try {
    logger.info('Iniciando conexão com o banco de dados...');
    await AppDataSource.initialize();
    logger.info('Conexão com o banco de dados estabelecida com sucesso!');
    
    // Executa migrações, se houver pendentes
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
    logger.error('Erro ao inicializar conexão com o banco de dados:', { error });
    throw error;
  }
};