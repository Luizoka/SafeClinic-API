import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const notificationRouter = Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestão de notificações
 */

// Middleware para autenticação em todas as rotas
notificationRouter.use(authenticate);

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
notificationRouter.get('/', notificationController.findAll);

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
notificationRouter.patch('/:id/read', notificationController.markAsRead);

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
notificationRouter.patch('/read-all', notificationController.markAllAsRead);

export default notificationRouter; 