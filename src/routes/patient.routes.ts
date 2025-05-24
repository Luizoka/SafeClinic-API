import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { validate } from '../middlewares/validation.middleware';
import { patientSchema } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';

const patientRouter = Router();
const patientController = new PatientController();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Gerenciamento de pacientes
 */

// Rotas públicas
patientRouter.post('/register', validate(patientSchema.create), patientController.create);
patientRouter.post('/', validate(patientSchema.create), patientController.create);

// Rotas protegidas
patientRouter.get('/', authenticate, patientController.findAll);
patientRouter.get('/:id', authenticate, patientController.findById);
patientRouter.put('/:id', authenticate, validate(patientSchema.update), patientController.update);
patientRouter.delete('/:id', authenticate, patientController.deactivate);

export default patientRouter;