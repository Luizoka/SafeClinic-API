import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import logger from '../utils/logger';

const notificationService = new NotificationService();

export class NotificationController {
  /**
   * @swagger
   * /notifications:
   *   get:
   *     tags: [Notifications]
   *     summary: Lista todas as notificações do usuário
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
   *         description: Lista de notificações paginada
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro no servidor
   */
  async findAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await notificationService.findAll(req.user!.id, page, limit);
      return res.json(result);
    } catch (error) {
      logger.error('Erro ao listar notificações:', { error });
      return res.status(500).json({ message: 'Erro ao buscar notificações' });
    }
  }

  /**
   * @swagger
   * /notifications/{id}/read:
   *   patch:
   *     tags: [Notifications]
   *     summary: Marca uma notificação como lida
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID da notificação
   *     responses:
   *       200:
   *         description: Notificação marcada como lida
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Notificação não encontrada
   *       500:
   *         description: Erro no servidor
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id, req.user!.id);
      return res.json(notification);
    } catch (error: any) {
      logger.error('Erro ao marcar notificação como lida:', { error, notificationId: req.params.id });
      
      if (error.message === 'Notificação não encontrada') {
        return res.status(404).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Erro ao marcar notificação como lida' });
    }
  }

  /**
   * @swagger
   * /notifications/read-all:
   *   patch:
   *     tags: [Notifications]
   *     summary: Marca todas as notificações como lidas
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Todas as notificações foram marcadas como lidas
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro no servidor
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.id);
      return res.json(result);
    } catch (error) {
      logger.error('Erro ao marcar todas as notificações como lidas:', { error });
      return res.status(500).json({ message: 'Erro ao marcar notificações como lidas' });
    }
  }
} 