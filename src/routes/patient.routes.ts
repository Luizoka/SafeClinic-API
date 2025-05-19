import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { validate } from '../middlewares/validation.middleware';
import { patientSchema } from '../utils/validators';

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
patientRouter.get('/', patientController.findAll);
patientRouter.get('/:id', patientController.findById);
patientRouter.put('/:id', validate(patientSchema.update), patientController.update);
patientRouter.delete('/:id', patientController.deactivate);

export default patientRouter;