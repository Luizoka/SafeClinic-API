import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate } from '../middlewares/auth.middleware';
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

// Cadastro de paciente (público)
patientRouter.post('/', validate(patientSchema.create), patientController.create);

// Rotas protegidas
patientRouter.use(authenticate);

patientRouter.get('/', patientController.findAll);
patientRouter.get('/:id', patientController.findById);
patientRouter.put('/:id', validate(patientSchema.update), patientController.update);
patientRouter.delete('/:id', patientController.deactivate);

export default patientRouter;