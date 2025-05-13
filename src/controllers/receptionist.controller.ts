import { Request, Response } from 'express';
import logger from '../utils/logger';
import { UserRole } from '../models/user.entity';

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

      // Placeholder - implementar serviço de recepcionista
      return res.json({
        data: [],
        metadata: {
          total: 0,
          page: 1,
          limit: 10
        }
      });
    } catch (error) {
      logger.error('Erro ao listar recepcionistas:', { error });
      return res.status(500).json({ message: 'Erro ao buscar recepcionistas' });
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
   *         description: ID do recepcionista
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
      // Apenas recepcionistas podem ver detalhes
      if (req.user?.role !== UserRole.RECEPTIONIST) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      return res.status(404).json({ message: 'Recepcionista não encontrado' });
    } catch (error) {
      logger.error('Erro ao buscar recepcionista:', { error, id: req.params.id });
      return res.status(500).json({ message: 'Erro ao buscar recepcionista' });
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
      // Apenas recepcionistas podem criar outros recepcionistas
      if (req.user?.role !== UserRole.RECEPTIONIST) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Placeholder - implementar serviço de recepcionista
      return res.status(501).json({ message: 'Funcionalidade ainda não implementada' });
    } catch (error) {
      logger.error('Erro ao criar recepcionista:', { error });
      return res.status(500).json({ message: 'Erro ao criar recepcionista' });
    }
  }
} 