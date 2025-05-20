import { AppDataSource } from '../database/data-source';
import { Patient } from '../models/patient.entity';
import { User, UserRole } from '../models/user.entity';
import bcrypt from 'bcryptjs';
import logger, { auditLog } from '../utils/logger';

const patientRepository = AppDataSource.getRepository(Patient);
const userRepository = AppDataSource.getRepository(User);

export class PatientService {
  // Buscar paciente por ID
  async findById(user_id: string): Promise<Patient | null> {
    try {
      const patient = await patientRepository.findOne({
        where: { user_id },
        relations: ['user']
      });
      return patient;
    } catch (error) {
      logger.error('Erro ao buscar paciente por ID:', { error, user_id });
      throw new Error('Falha ao buscar paciente');
    }
  }

  // Listar todos os pacientes (para recepcionistas e médicos)
  async findAll(page: number = 1, limit: number = 10): Promise<{
    patients: Patient[],
    total: number,
    page: number,
    totalPages: number
  }> {
    try {
      const [patients, total] = await patientRepository.findAndCount({
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
        order: { created_at: 'DESC' }
      });

      return {
        patients,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Erro ao listar pacientes:', { error });
      throw new Error('Falha ao listar pacientes');
    }
  }

  // Criar novo paciente
  async create(patientData: {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone?: string;
    birth_date: Date;
    health_insurance?: string;
    emergency_contact?: string;
    blood_type?: string;
    allergies?: string;
  }): Promise<Patient> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se email ou CPF já existem
        const existingUser = await queryRunner.manager.findOne(User, {
          where: [
            { email: patientData.email },
            { cpf: patientData.cpf }
          ]
        });

        if (existingUser) {
          throw new Error('Email ou CPF já cadastrados');
        }

        // Criar usuário
        const passwordHash = await bcrypt.hash(patientData.password, 10);

        const newUser = queryRunner.manager.create(User, {
          email: patientData.email,
          password_hash: passwordHash,
          name: patientData.name,
          cpf: patientData.cpf,
          phone: patientData.phone,
          role: UserRole.PATIENT
        });

        const savedUser = await queryRunner.manager.save(newUser);

        // Criar paciente
        const newPatient = queryRunner.manager.create(Patient, {
          user_id: savedUser.id,
          birth_date: patientData.birth_date,
          health_insurance: patientData.health_insurance,
          emergency_contact: patientData.emergency_contact,
          blood_type: patientData.blood_type,
          allergies: patientData.allergies
        });

        const savedPatient = await queryRunner.manager.save(newPatient);

        // Commit da transação
        await queryRunner.commitTransaction();

        // Log de auditoria
        auditLog('PATIENT_CREATED', savedUser.id, {
          patientId: savedPatient.user_id
        });

        return savedPatient;
      } catch (error) {
        // Rollback em caso de erro
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Liberar o query runner
        await queryRunner.release();
      }
    } catch (error) {
      logger.error('Erro ao criar paciente:', { error });
      throw error;
    }
  }

  // Atualizar paciente
  async update(user_id: string, patientData: {
    name?: string;
    phone?: string;
    birth_date?: Date;
    health_insurance?: string;
    emergency_contact?: string;
    blood_type?: string;
    allergies?: string;
  }, updatedBy: string): Promise<Patient> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Buscar paciente
        const patient = await queryRunner.manager.findOne(Patient, {
          where: { user_id },
          relations: ['user']
        });

        if (!patient) {
          throw new Error('Paciente não encontrado');
        }

        // Verificar se os dados do usuário precisam ser atualizados
        if (patientData.name || patientData.phone) {
          const userUpdateData: any = {};
          
          if (patientData.name) userUpdateData.name = patientData.name;
          if (patientData.phone) userUpdateData.phone = patientData.phone;

          await queryRunner.manager.update(User, patient.user_id, userUpdateData);
        }

        // Atualizar dados do paciente
        const patientUpdateData: any = {};
        
        if (patientData.birth_date) patientUpdateData.birth_date = patientData.birth_date;
        if (patientData.health_insurance) patientUpdateData.health_insurance = patientData.health_insurance;
        if (patientData.emergency_contact) patientUpdateData.emergency_contact = patientData.emergency_contact;
        if (patientData.blood_type) patientUpdateData.blood_type = patientData.blood_type;
        if (patientData.allergies) patientUpdateData.allergies = patientData.allergies;

        await queryRunner.manager.update(Patient, user_id, patientUpdateData);

        // Buscar paciente atualizado
        const updatedPatient = await queryRunner.manager.findOne(Patient, {
          where: { user_id },
          relations: ['user']
        });

        // Commit da transação
        await queryRunner.commitTransaction();

        // Log de auditoria
        auditLog('PATIENT_UPDATED', updatedBy, {
          patientId: user_id,
          updatedFields: Object.keys({ ...patientData })
        });

        return updatedPatient!;
      } catch (error) {
        // Rollback em caso de erro
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Liberar o query runner
        await queryRunner.release();
      }
    } catch (error) {
      logger.error('Erro ao atualizar paciente:', { error, patientId: user_id });
      throw error;
    }
  }

  // Desativar paciente
  async deactivate(user_id: string, updatedBy: string): Promise<void> {
    try {
      const patient = await patientRepository.findOne({
        where: { user_id },
        relations: ['user']
      });
      if (!patient) throw new Error('Paciente não encontrado');
      await userRepository.update(patient.user_id, { status: false });
      auditLog('PATIENT_DEACTIVATED', updatedBy, { patientId: user_id });
    } catch (error) {
      logger.error('Erro ao desativar paciente:', { error, user_id });
      throw error;
    }
  }
}