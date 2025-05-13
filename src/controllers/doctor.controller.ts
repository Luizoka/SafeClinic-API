import { Request, Response } from 'express';
import { DoctorService } from '../services/doctor.service';
import logger from '../utils/logger';
import { UserRole } from '../models/user.entity';

const doctorService = new DoctorService();

export class DoctorController {
  /**
   * @swagger
   * /doctors:
   *   get:
   *     tags: [Doctors]
   *     summary: Lista todos os médicos
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
   *         description: Lista de médicos paginada
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro no servidor
   */
  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await doctorService.findAll(page, limit);
      return res.json(result);
    } catch (error) {
      logger.error('Erro ao listar médicos:', { error });
      return res.status(500).json({ message: 'Erro ao buscar médicos' });
    }
  }

  /**
   * @swagger
   * /doctors/speciality/{speciality}:
   *   get:
   *     tags: [Doctors]
   *     summary: Busca médicos por especialidade
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: speciality
   *         required: true
   *         schema:
   *           type: string
   *         description: Especialidade médica
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
   *         description: Lista de médicos paginada
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro no servidor
   */
  async findBySpeciality(req: Request, res: Response) {
    try {
      const { speciality } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!speciality) {
        return res.status(400).json({ message: 'Especialidade é obrigatória' });
      }

      const result = await doctorService.findBySpeciality(speciality, page, limit);
      return res.json(result);
    } catch (error) {
      logger.error('Erro ao buscar médicos por especialidade:', { error, speciality: req.params.speciality });
      return res.status(500).json({ message: 'Erro ao buscar médicos por especialidade' });
    }
  }

  /**
   * @swagger
   * /doctors/{id}:
   *   get:
   *     tags: [Doctors]
   *     summary: Busca médico pelo ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do médico
   *     responses:
   *       200:
   *         description: Dados do médico
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Médico não encontrado
   *       500:
   *         description: Erro no servidor
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar acesso: próprio médico ou acesso permitido
      if (
        req.user?.role === UserRole.DOCTOR && 
        !(await this.isOwnDoctorProfile(req.user.id, id))
      ) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const doctor = await doctorService.findById(id);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Médico não encontrado' });
      }

      return res.json(doctor);
    } catch (error) {
      logger.error('Erro ao buscar médico:', { error, doctorId: req.params.id });
      return res.status(500).json({ message: 'Erro ao buscar médico' });
    }
  }

  /**
   * @swagger
   * /doctors:
   *   post:
   *     tags: [Doctors]
   *     summary: Cria um novo médico (apenas recepcionistas)
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
   *               - crm
   *               - speciality
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
   *               crm:
   *                 type: string
   *               speciality:
   *                 type: string
   *               professional_statement:
   *                 type: string
   *               consultation_duration:
   *                 type: integer
   *                 default: 30
   *     responses:
   *       201:
   *         description: Médico criado com sucesso
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       409:
   *         description: Email, CPF ou CRM já cadastrados
   *       500:
   *         description: Erro no servidor
   */
  async create(req: Request, res: Response) {
    try {
      // Apenas recepcionistas podem criar médicos
      if (req.user?.role !== UserRole.RECEPTIONIST) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Validação básica dos campos obrigatórios
      const { name, email, password, cpf, crm, speciality } = req.body;
      
      if (!name || !email || !password || !cpf || !crm || !speciality) {
        return res.status(400).json({ 
          message: 'Campos obrigatórios: nome, email, senha, CPF, CRM e especialidade' 
        });
      }

      const doctor = await doctorService.create(req.body);
      return res.status(201).json(doctor);
    } catch (error: any) {
      logger.error('Erro ao criar médico:', { error });
      
      if (error.message === 'Email ou CPF já cadastrados' || error.message === 'CRM já cadastrado') {
        return res.status(409).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao criar médico' });
    }
  }

  /**
   * @swagger
   * /doctors/{id}:
   *   put:
   *     tags: [Doctors]
   *     summary: Atualiza dados do médico (próprio médico ou recepcionista)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do médico
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
   *               speciality:
   *                 type: string
   *               professional_statement:
   *                 type: string
   *               consultation_duration:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Médico atualizado com sucesso
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Médico não encontrado
   *       500:
   *         description: Erro no servidor
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar acesso: próprio médico ou recepcionista
      if (
        req.user?.role === UserRole.DOCTOR && 
        !(await this.isOwnDoctorProfile(req.user.id, id))
      ) {
        return res.status(403).json({ message: 'Acesso negado' });
      } else if (req.user?.role !== UserRole.DOCTOR && req.user?.role !== UserRole.RECEPTIONIST) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Verificar se há algo para atualizar
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Nenhum dado para atualizar' });
      }

      const doctor = await doctorService.update(id, req.body, req.user!.id);
      return res.json(doctor);
    } catch (error: any) {
      logger.error('Erro ao atualizar médico:', { error, doctorId: req.params.id });
      
      if (error.message === 'Médico não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao atualizar médico' });
    }
  }

  /**
   * @swagger
   * /doctors/{id}:
   *   delete:
   *     tags: [Doctors]
   *     summary: Desativa o médico (apenas recepcionistas)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do médico
   *     responses:
   *       200:
   *         description: Médico desativado com sucesso
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Médico não encontrado
   *       500:
   *         description: Erro no servidor
   */
  async deactivate(req: Request, res: Response) {
    try {
      // Apenas recepcionistas podem desativar médicos
      if (req.user?.role !== UserRole.RECEPTIONIST) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { id } = req.params;
      await doctorService.deactivate(id, req.user.id);
      
      return res.json({ message: 'Médico desativado com sucesso' });
    } catch (error: any) {
      logger.error('Erro ao desativar médico:', { error, doctorId: req.params.id });
      
      if (error.message === 'Médico não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao desativar médico' });
    }
  }

  // Método auxiliar para verificar se é o próprio perfil do médico
  private async isOwnDoctorProfile(userId: string, doctorId: string): Promise<boolean> {
    try {
      const doctor = await doctorService.findById(doctorId);
      return doctor?.user_id === userId;
    } catch (error) {
      return false;
    }
  }
} 