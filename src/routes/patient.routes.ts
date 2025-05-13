import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { patientSchema } from '../utils/validators';
import { UserRole } from '../models/user.entity';

const patientRouter = Router();
const patientController = new PatientController();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Gerenciamento de pacientes
 */

// Rota pública para registro de pacientes
patientRouter.post('/register', validate(patientSchema.create), patientController.create);

// Middleware para autenticação nas demais rotas
patientRouter.use(authenticate);

// Rotas de pacientes
patientRouter.get('/', authorize([UserRole.DOCTOR, UserRole.RECEPTIONIST]), patientController.findAll);
patientRouter.get('/:id', authorize([UserRole.PATIENT, UserRole.DOCTOR, UserRole.RECEPTIONIST]), patientController.findById);
patientRouter.post('/', authorize([UserRole.RECEPTIONIST]), validate(patientSchema.create), patientController.create);
patientRouter.put('/:id', authorize([UserRole.PATIENT, UserRole.RECEPTIONIST]), validate(patientSchema.update), patientController.update);
patientRouter.delete('/:id', authorize([UserRole.RECEPTIONIST]), patientController.deactivate);

export default patientRouter; 