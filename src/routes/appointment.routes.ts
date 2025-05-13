import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.entity';

const appointmentRouter = Router();
const appointmentController = new AppointmentController();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Gerenciamento de consultas
 */

// Middleware para autenticação em todas as rotas
appointmentRouter.use(authenticate);

// Rotas de consultas
appointmentRouter.get('/', appointmentController.findAll);
appointmentRouter.get('/:id', appointmentController.findById);
appointmentRouter.post('/', authorize([UserRole.PATIENT, UserRole.RECEPTIONIST]), appointmentController.create);

export default appointmentRouter;