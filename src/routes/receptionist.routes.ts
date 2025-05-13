import { Router } from 'express';
import { ReceptionistController } from '../controllers/receptionist.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.entity';

const receptionistRouter = Router();
const receptionistController = new ReceptionistController();

/**
 * @swagger
 * tags:
 *   name: Receptionists
 *   description: Gerenciamento de recepcionistas
 */

// Middleware para autenticação em todas as rotas
receptionistRouter.use(authenticate);

// Rotas de recepcionistas
receptionistRouter.get('/', authorize([UserRole.RECEPTIONIST]), receptionistController.findAll);
receptionistRouter.get('/:id', authorize([UserRole.RECEPTIONIST]), receptionistController.findById);
receptionistRouter.post('/', authorize([UserRole.RECEPTIONIST]), receptionistController.create);

export default receptionistRouter; 