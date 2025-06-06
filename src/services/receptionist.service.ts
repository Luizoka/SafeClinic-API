import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../models/user.entity';
import { Receptionist } from '../models/receptionist.entity';
import { WorkShift } from '../models/receptionist.entity';
import logger from '../utils/logger';

const userRepository = AppDataSource.getRepository(User);
const receptionistRepository = AppDataSource.getRepository(Receptionist);

export class ReceptionistService {
  async createFirstReceptionist(data: {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone?: string;
    work_shift: WorkShift;
  }) {
    try {
      logger.info('Iniciando criação do primeiro recepcionista:', { data: { ...data, password: '[REDACTED]' } });

      // Verificar se já existe algum recepcionista
      const existingReceptionist = await receptionistRepository.find({
        relations: ['user']
      });

      if (existingReceptionist.length > 0) {
        logger.info('Já existe um recepcionista cadastrado');
        throw new Error('Já existe um recepcionista cadastrado no sistema');
      }

      // Verificar se email ou CPF já estão cadastrados
      const existingUser = await userRepository.findOne({
        where: [
          { email: data.email },
          { cpf: data.cpf }
        ]
      });

      if (existingUser) {
        logger.info('Email ou CPF já cadastrados');
        throw new Error('Email ou CPF já cadastrados');
      }

      // Criar usuário
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = userRepository.create({
        name: data.name,
        email: data.email,
        password_hash: hashedPassword,
        cpf: data.cpf,
        phone: data.phone || null,
        role: UserRole.RECEPTIONIST
      });

      logger.info('Salvando usuário...');
      let savedUser;
      try {
        savedUser = await userRepository.save(user);
        logger.info('Usuário salvo com sucesso:', { userId: savedUser.id });
      } catch (error) {
        logger.error('Erro ao salvar usuário:', { error });
        throw new Error('Erro ao salvar usuário: ' + (error as Error).message);
      }

      // Criar recepcionista
      const receptionist = receptionistRepository.create({
        user_id: savedUser.id,
        work_shift: data.work_shift
      });

      logger.info('Salvando recepcionista...');
      let savedReceptionist;
      try {
        savedReceptionist = await receptionistRepository.save(receptionist);
        logger.info('Recepcionista salvo com sucesso:', { receptionistId: savedReceptionist.user_id });
      } catch (error) {
        logger.error('Erro ao salvar recepcionista:', { error });
        // Se falhar ao salvar o recepcionista, precisamos remover o usuário criado
        await userRepository.remove(savedUser);
        throw new Error('Erro ao salvar recepcionista: ' + (error as Error).message);
      }

      // Retornar dados sem a senha
      const { password_hash, ...userWithoutPassword } = savedUser;
      return {
        ...userWithoutPassword,
        receptionist: {
          id: savedReceptionist.user_id,
          work_shift: savedReceptionist.work_shift
        }
      };
    } catch (error) {
      logger.error('Erro ao criar primeiro recepcionista:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone?: string;
    work_shift: WorkShift;
  }) {
    try {
      logger.info('Iniciando criação de recepcionista:', { data: { ...data, password: '[REDACTED]' } });

      // Verificar se email ou CPF já estão cadastrados
      const existingUser = await userRepository.findOne({
        where: [
          { email: data.email },
          { cpf: data.cpf }
        ]
      });

      if (existingUser) {
        logger.info('Email ou CPF já cadastrados');
        throw new Error('Email ou CPF já cadastrados');
      }

      // Criar usuário
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = userRepository.create({
        name: data.name,
        email: data.email,
        password_hash: hashedPassword,
        cpf: data.cpf,
        phone: data.phone || null,
        role: UserRole.RECEPTIONIST
      });

      logger.info('Salvando usuário...');
      let savedUser;
      try {
        savedUser = await userRepository.save(user);
        logger.info('Usuário salvo com sucesso:', { userId: savedUser.id });
      } catch (error) {
        logger.error('Erro ao salvar usuário:', { error });
        throw new Error('Erro ao salvar usuário: ' + (error as Error).message);
      }

      // Criar recepcionista
      const receptionist = receptionistRepository.create({
        user_id: savedUser.id,
        work_shift: data.work_shift
      });

      logger.info('Salvando recepcionista...');
      let savedReceptionist;
      try {
        savedReceptionist = await receptionistRepository.save(receptionist);
        logger.info('Recepcionista salvo com sucesso:', { receptionistId: savedReceptionist.user_id });
      } catch (error) {
        logger.error('Erro ao salvar recepcionista:', { error });
        // Se falhar ao salvar o recepcionista, precisamos remover o usuário criado
        await userRepository.remove(savedUser);
        throw new Error('Erro ao salvar recepcionista: ' + (error as Error).message);
      }

      // Retornar dados sem a senha
      const { password_hash, ...userWithoutPassword } = savedUser;
      return {
        ...userWithoutPassword,
        receptionist: {
          id: savedReceptionist.user_id,
          work_shift: savedReceptionist.work_shift
        }
      };
    } catch (error) {
      logger.error('Erro ao criar recepcionista:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async findById(user_id: string) {
    try {
      const receptionist = await receptionistRepository.findOne({
        where: { user_id },
        relations: ['user']
      });

      if (!receptionist) {
        return null;
      }

      // Retornar dados sem a senha
      const { password_hash, ...userWithoutPassword } = receptionist.user;
      return {
        ...userWithoutPassword,
        receptionist: {
          user_id: receptionist.user_id,
          work_shift: receptionist.work_shift
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar recepcionista:', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        user_id
      });
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const [receptionists, total] = await receptionistRepository.findAndCount({
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
        order: { created_at: 'DESC' }
      });

      // Retornar dados sem a senha
      const data = receptionists.map(r => {
        const { password_hash, ...userWithoutPassword } = r.user;
        return {
          ...userWithoutPassword,
          receptionist: {
            user_id: r.user_id,
            work_shift: r.work_shift
          }
        };
      });

      return {
        data,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar recepcionistas:', { error });
      throw new Error('Erro ao buscar recepcionistas');
    }
  }
}