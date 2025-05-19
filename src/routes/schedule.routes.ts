import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.entity';
import { validate } from '../middlewares/validation.middleware';
import { scheduleSchema } from '../utils/validators';

const scheduleRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Gerenciamento de agendas dos médicos
 */

// Middleware para autenticação em todas as rotas
scheduleRouter.use(authenticate);

/**
 * @swagger
 * /schedules:
 *   post:
 *     tags: [Schedules]
 *     summary: Cria um novo horário de atendimento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - day_of_week
 *               - start_time
 *               - end_time
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *               day_of_week:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               is_available:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Horário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro no servidor
 */
scheduleRouter.post('/', 
  authorize([UserRole.DOCTOR, UserRole.RECEPTIONIST]),
  validate(scheduleSchema.create),
  async (req, res) => {
    // Implementação pendente
    res.status(501).json({ message: 'Funcionalidade ainda não implementada' });
  }
);

/**
 * @swagger
 * /schedules/block:
 *   post:
 *     tags: [Schedules]
 *     summary: Cria um bloqueio de horário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - start_datetime
 *               - end_datetime
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 format: uuid
 *               start_datetime:
 *                 type: string
 *                 format: date-time
 *               end_datetime:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bloqueio criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro no servidor
 */
scheduleRouter.post('/block',
  authorize([UserRole.DOCTOR, UserRole.RECEPTIONIST]),
  validate(scheduleSchema.createBlock),
  async (req, res) => {
    // Implementação pendente
    res.status(501).json({ message: 'Funcionalidade ainda não implementada' });
  }
);

export default scheduleRouter; 