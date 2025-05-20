import { AppDataSource } from '../database/data-source';
import { Doctor } from '../models/doctor.entity';
import { User, UserRole } from '../models/user.entity';
import { Speciality } from '../models/speciality.entity';
import bcrypt from 'bcryptjs';
import logger, { auditLog } from '../utils/logger';

const doctorRepository = AppDataSource.getRepository(Doctor);
const userRepository = AppDataSource.getRepository(User);
const specialityRepository = AppDataSource.getRepository(Speciality);

export class DoctorService {
  // Buscar médico por ID
  async findById(id: string): Promise<Doctor | null> {
    try {
      const doctor = await doctorRepository.findOne({
        where: { id: id },
        relations: ['user']
      });
      return doctor;
    } catch (error) {
      logger.error('Erro ao buscar médico por ID:', { error, doctorId: id });
      throw new Error('Falha ao buscar médico');
    }
  }

  // Listar todos os médicos
  async findAll(page: number = 1, limit: number = 10): Promise<{
    doctors: Doctor[],
    total: number,
    page: number,
    totalPages: number
  }> {
    try {
      const [doctors, total] = await doctorRepository.findAndCount({
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
        order: { created_at: 'DESC' }
      });

      return {
        doctors,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Erro ao listar médicos:', { error });
      throw new Error('Falha ao listar médicos');
    }
  }

  // Buscar médicos por especialidade
  async findBySpeciality(speciality: string, page: number = 1, limit: number = 10): Promise<{
    doctors: Doctor[],
    total: number,
    page: number,
    totalPages: number
  }> {
    try {
      const [doctors, total] = await doctorRepository.findAndCount({
        where: {
          speciality_id: speciality
        },
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
        order: { created_at: 'DESC' }
      });

      return {
        doctors,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Erro ao buscar médicos por especialidade:', { error, speciality });
      throw new Error('Falha ao buscar médicos por especialidade');
    }
  }

  // Criar novo médico
  async create(doctorData: {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone?: string;
    crm: string;
    speciality_id: string;
    professional_statement?: string;
    consultation_duration?: number;
  }): Promise<Doctor> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se email, CPF ou CRM já existem
        const existingUser = await queryRunner.manager.findOne(User, {
          where: [
            { email: doctorData.email },
            { cpf: doctorData.cpf }
          ]
        });

        if (existingUser) {
          throw new Error('Email ou CPF já cadastrados');
        }

        const existingDoctor = await queryRunner.manager.findOne(Doctor, {
          where: { crm: doctorData.crm }
        });

        if (existingDoctor) {
          throw new Error('CRM já cadastrado');
        }

        // Verificar se especialidade existe
        const speciality = await specialityRepository.findOne({ where: { id: doctorData.speciality_id } });
        if (!speciality) {
          throw new Error('Especialidade não encontrada');
        }

        // Criar usuário
        const passwordHash = await bcrypt.hash(doctorData.password, 10);

        const newUser = queryRunner.manager.create(User, {
          email: doctorData.email,
          password_hash: passwordHash,
          name: doctorData.name,
          cpf: doctorData.cpf,
          phone: doctorData.phone,
          role: UserRole.DOCTOR
        });

        const savedUser = await queryRunner.manager.save(newUser);

        // Criar médico
        const newDoctor = queryRunner.manager.create(Doctor, {
          user_id: savedUser.id,
          crm: doctorData.crm,
          speciality_id: doctorData.speciality_id,
          professional_statement: doctorData.professional_statement,
          consultation_duration: doctorData.consultation_duration || 30
        });

        const savedDoctor = await queryRunner.manager.save(newDoctor);

        // Commit da transação
        await queryRunner.commitTransaction();

        // Log de auditoria
        auditLog('DOCTOR_CREATED', savedUser.id, {
          doctorId: savedDoctor.id
        });

        return savedDoctor;
      } catch (error) {
        // Rollback em caso de erro
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Liberar o query runner
        await queryRunner.release();
      }
    } catch (error) {
      logger.error('Erro ao criar médico:', { error });
      throw error;
    }
  }

  // Atualizar médico
  async update(id: string, doctorData: {
    name?: string;
    phone?: string;
    speciality_id?: string;
    professional_statement?: string;
    consultation_duration?: number;
  }, userId: string): Promise<Doctor> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Buscar médico
        const doctor = await queryRunner.manager.findOne(Doctor, {
          where: { id },
          relations: ['user']
        });

        if (!doctor) {
          throw new Error('Médico não encontrado');
        }

        // Verificar se os dados do usuário precisam ser atualizados
        if (doctorData.name || doctorData.phone) {
          const userUpdateData: any = {};
          
          if (doctorData.name) userUpdateData.name = doctorData.name;
          if (doctorData.phone) userUpdateData.phone = doctorData.phone;

          await queryRunner.manager.update(User, doctor.user_id, userUpdateData);
        }

        // Atualizar dados do médico
        const doctorUpdateData: any = {};
        
        if (doctorData.speciality_id) {
          // Verificar se especialidade existe
          const speciality = await specialityRepository.findOne({ where: { id: doctorData.speciality_id } });
          if (!speciality) {
            throw new Error('Especialidade não encontrada');
          }
          doctorUpdateData.speciality_id = doctorData.speciality_id;
        }
        if (doctorData.professional_statement) doctorUpdateData.professional_statement = doctorData.professional_statement;
        if (doctorData.consultation_duration) doctorUpdateData.consultation_duration = doctorData.consultation_duration;

        await queryRunner.manager.update(Doctor, id, doctorUpdateData);

        // Buscar médico atualizado
        const updatedDoctor = await queryRunner.manager.findOne(Doctor, {
          where: { id },
          relations: ['user']
        });

        // Commit da transação
        await queryRunner.commitTransaction();

        // Log de auditoria
        auditLog('DOCTOR_UPDATED', userId, {
          doctorId: id,
          updatedFields: Object.keys({ ...doctorData })
        });

        return updatedDoctor!;
      } catch (error) {
        // Rollback em caso de erro
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Liberar o query runner
        await queryRunner.release();
      }
    } catch (error) {
      logger.error('Erro ao atualizar médico:', { error, doctorId: id });
      throw error;
    }
  }

  // Desativar médico
  async deactivate(id: string, userId: string): Promise<void> {
    try {
      const doctor = await doctorRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!doctor) {
        throw new Error('Médico não encontrado');
      }

      // Desativar usuário
      await userRepository.update(doctor.user_id, { status: false });

      // Log de auditoria
      auditLog('DOCTOR_DEACTIVATED', userId, {
        doctorId: id
      });
    } catch (error) {
      logger.error('Erro ao desativar médico:', { error, doctorId: id });
      throw error;
    }
  }
}