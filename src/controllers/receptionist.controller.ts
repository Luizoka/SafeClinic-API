import { Request, Response } from 'express';
import { ReceptionistService } from '../services/receptionist.service';
import logger from '../utils/logger';
import { UserRole } from '../models/user.entity';

const receptionistService = new ReceptionistService();

export class ReceptionistController {
  /**
   * @swagger
   * /receptionists:
   *   get:
   *     tags: [Receptionists]
   *     summary: Lista todos os recepcionistas (apenas recepcionistas)
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
   *         description: Lista de recepcionistas paginada
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       500:
   *         description: Erro no servidor
   */
  async findAll(req: Request, res: Response) {
    try {
      // Apenas recepcionistas podem ver a lista
      if (req.user?.role !== UserRole.RECEPTIONIST) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await receptionistService.findAll(page, limit);
      return res.json(result);
    } catch (error) {
      logger.error('Erro ao listar recepcionistas:', { error });
      return res.status(500).json({ message: 'Erro ao buscar recepcionistas' });
    }
  }

  /**
   * @swagger
   * /receptionists/register:
   *   post:
   *     tags: [Receptionists]
   *     summary: Cria o primeiro recepcionista do sistema
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
   *               - work_shift
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
   *               work_shift:
   *                 type: string
   *                 enum: [morning, afternoon, night]
   *     responses:
   *       201:
   *         description: Recepcionista criado com sucesso
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: Email ou CPF já cadastrados
   *       500:
   *         description: Erro no servidor
   */
  async createFirstReceptionist(req: Request, res: Response) {
    try {
      const receptionist = await receptionistService.createFirstReceptionist(req.body);
      return res.status(201).json(receptionist);
    } catch (error: any) {
      logger.error('Erro ao criar primeiro recepcionista:', { error });
      
      if (error.message === 'Email ou CPF já cadastrados') {
        return res.status(409).json({ message: error.message });
      }
      
      if (error.message === 'Já existe um recepcionista cadastrado no sistema') {
        return res.status(409).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao criar recepcionista' });
    }
  }

  /**
   * @swagger
   * /receptionists:
   *   post:
   *     tags: [Receptionists]
   *     summary: Cria um novo recepcionista (apenas recepcionistas)
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
   *               - work_shift
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
   *               work_shift:
   *                 type: string
   *                 enum: [morning, afternoon, night]
   *     responses:
   *       201:
   *         description: Recepcionista criado com sucesso
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       409:
   *         description: Email ou CPF já cadastrados
   *       500:
   *         description: Erro no servidor
   */
  async create(req: Request, res: Response) {
    try {
      const receptionist = await receptionistService.create(req.body);
      return res.status(201).json(receptionist);
    } catch (error: any) {
      logger.error('Erro ao criar recepcionista:', { error });
      
      if (error.message === 'Email ou CPF já cadastrados') {
        return res.status(409).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao criar recepcionista' });
    }
  }

  /**
   * @swagger
   * /receptionists/{id}:
   *   get:
   *     tags: [Receptionists]
   *     summary: Busca recepcionista pelo ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do recepcionista (user_id)
   *     responses:
   *       200:
   *         description: Dados do recepcionista
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Recepcionista não encontrado
   *       500:
   *         description: Erro no servidor
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const receptionist = await receptionistService.findById(id);
      
      if (!receptionist) {
        return res.status(404).json({ message: 'Recepcionista não encontrado' });
      }
      
      return res.json(receptionist);
    } catch (error) {
      logger.error('Erro ao buscar recepcionista:', { error, id: req.params.id });
      return res.status(500).json({ message: 'Erro ao buscar recepcionista' });
    }
  }
}