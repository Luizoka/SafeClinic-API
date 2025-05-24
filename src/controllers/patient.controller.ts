import { Request, Response } from 'express';
import { PatientService } from '../services/patient.service';
import logger from '../utils/logger';
import { UserRole } from '../models/user.entity';

const patientService = new PatientService();

export class PatientController {
  /**
   * @swagger
   * /patients:
   *   get:
   *     tags: [Patients]
   *     summary: Lista todos os pacientes (apenas médicos e recepcionistas)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de itens por página
   *     responses:
   *       200:
   *         description: Lista de pacientes paginada
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       500:
   *         description: Erro no servidor
   */
  async findAll(req: Request, res: Response) {
    try {
      // Aceita tanto minúsculo quanto maiúsculo
      const role = req.user?.role;
      if (
        !role ||
        (role.toString().toLowerCase() !== 'doctor' && role.toString().toLowerCase() !== 'receptionist')
      ) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await patientService.findAll(page, limit);
      return res.json(result);
    } catch (error) {
      logger.error('Erro ao listar pacientes:', { error });
      return res.status(500).json({ message: 'Erro ao buscar pacientes' });
    }
  }

  /**
   * @swagger
   * /patients/{id}:
   *   get:
   *     tags: [Patients]
   *     summary: Busca paciente pelo ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do paciente (user_id)
   *     responses:
   *       200:
   *         description: Dados do paciente
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Paciente não encontrado
   *       500:
   *         description: Erro no servidor
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Validar acesso: próprio paciente, médico ou recepcionista
      if (
        req.user?.role === UserRole.PATIENT && 
        !(await this.isOwnPatientProfile(req.user.id, id))
      ) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const patient = await patientService.findById(id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Paciente não encontrado' });
      }

      return res.json(patient);
    } catch (error) {
      logger.error('Erro ao buscar paciente:', { error, patientId: req.params.id });
      return res.status(500).json({ message: 'Erro ao buscar paciente' });
    }
  }

  /**
   * @swagger
   * /patients:
   *   post:
   *     tags: [Patients]
   *     summary: Cria um novo paciente
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *               - cpf
   *               - birth_date
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               cpf:
   *                 type: string
   *               phone:
   *                 type: string
   *               birth_date:
   *                 type: string
   *                 format: date
   *               health_insurance:
   *                 type: string
   *               emergency_contact:
   *                 type: string
   *               blood_type:
   *                 type: string
   *               allergies:
   *                 type: string
   *     responses:
   *       201:
   *         description: Paciente criado com sucesso
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: Email ou CPF já cadastrados
   *       500:
   *         description: Erro no servidor
   */
  async create(req: Request, res: Response) {
    try {
      // Validação básica dos campos obrigatórios
      const { name, email, password, cpf, birth_date } = req.body;
      
      if (!name || !email || !password || !cpf || !birth_date) {
        return res.status(400).json({ 
          message: 'Campos obrigatórios: nome, email, senha, CPF e data de nascimento' 
        });
      }

      // Formatação da data de nascimento
      const formattedData = {
        ...req.body,
        birth_date: new Date(birth_date)
      };

      const patient = await patientService.create(formattedData);
      return res.status(201).json(patient);
    } catch (error: any) {
      logger.error('Erro ao criar paciente:', { error });
      
      if (error.message === 'Email ou CPF já cadastrados') {
        return res.status(409).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao criar paciente' });
    }
  }

  /**
   * @swagger
   * /patients/{id}:
   *   put:
   *     tags: [Patients]
   *     summary: Atualiza dados do paciente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do paciente (user_id)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               phone:
   *                 type: string
   *               birth_date:
   *                 type: string
   *                 format: date
   *               health_insurance:
   *                 type: string
   *               emergency_contact:
   *                 type: string
   *               blood_type:
   *                 type: string
   *               allergies:
   *                 type: string
   *     responses:
   *       200:
   *         description: Paciente atualizado com sucesso
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Paciente não encontrado
   *       500:
   *         description: Erro no servidor
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar acesso: próprio paciente ou recepcionista
      if (
        req.user?.role === UserRole.PATIENT && 
        !(await this.isOwnPatientProfile(req.user.id, id))
      ) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Verificar se há algo para atualizar
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Nenhum dado para atualizar' });
      }

      // Formatar dados de entrada
      const updateData: any = { ...req.body };
      if (updateData.birth_date) {
        updateData.birth_date = new Date(updateData.birth_date);
      }

      const patient = await patientService.update(id, updateData, req.user!.id);
      return res.json(patient);
    } catch (error: any) {
      logger.error('Erro ao atualizar paciente:', { error, patientId: req.params.id });
      
      if (error.message === 'Paciente não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao atualizar paciente' });
    }
  }

  /**
   * @swagger
   * /patients/{id}:
   *   delete:
   *     tags: [Patients]
   *     summary: Desativa o paciente (apenas recepcionistas)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do paciente (user_id)
   *     responses:
   *       200:
   *         description: Paciente desativado com sucesso
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Paciente não encontrado
   *       500:
   *         description: Erro no servidor
   */
  async deactivate(req: Request, res: Response) {
    try {
      // Apenas recepcionistas podem desativar pacientes
      if (req.user?.role !== UserRole.RECEPTIONIST) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { id } = req.params;
      await patientService.deactivate(id, req.user.id);
      
      return res.json({ message: 'Paciente desativado com sucesso' });
    } catch (error: any) {
      logger.error('Erro ao desativar paciente:', { error, patientId: req.params.id });
      
      if (error.message === 'Paciente não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao desativar paciente' });
    }
  }

  // Método auxiliar para verificar se é o próprio perfil do paciente
  private async isOwnPatientProfile(userId: string, patientId: string): Promise<boolean> {
    try {
      const patient = await patientService.findById(patientId);
      return patient?.user_id === userId;
    } catch (error) {
      return false;
    }
  }
}