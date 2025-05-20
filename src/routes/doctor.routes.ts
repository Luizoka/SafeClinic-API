import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { doctorSchema } from '../utils/validators';
import { UserRole } from '../models/user.entity';

const doctorRouter = Router();
const doctorController = new DoctorController();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Gerenciamento de médicos
 */

// Middleware para autenticação em todas as rotas
doctorRouter.use(authenticate);

// Rotas de médicos
doctorRouter.get('/', authorize([UserRole.PATIENT, UserRole.DOCTOR, UserRole.RECEPTIONIST]), doctorController.findAll);
doctorRouter.get('/speciality/:speciality', authorize([UserRole.PATIENT, UserRole.DOCTOR, UserRole.RECEPTIONIST]), doctorController.findBySpeciality);
doctorRouter.get('/:id', authorize([UserRole.PATIENT, UserRole.DOCTOR, UserRole.RECEPTIONIST]), doctorController.findById);
doctorRouter.post('/', authorize([UserRole.RECEPTIONIST]), validate(doctorSchema.create), doctorController.create);
doctorRouter.put('/:id', authorize([UserRole.DOCTOR, UserRole.RECEPTIONIST]), validate(doctorSchema.update), doctorController.update);
doctorRouter.delete('/:id', authorize([UserRole.RECEPTIONIST]), doctorController.deactivate);

export default doctorRouter;