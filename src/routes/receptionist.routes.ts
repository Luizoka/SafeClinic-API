import { Router } from 'express';
import { ReceptionistController } from '../controllers/receptionist.controller';
import { validate } from '../middlewares/validation.middleware';
import { receptionistSchema } from '../utils/validators';

const receptionistRouter = Router();
const receptionistController = new ReceptionistController();

/**
 * @swagger
 * tags:
 *   name: Receptionists
 *   description: Gerenciamento de recepcionistas
 */

// Rotas públicas
receptionistRouter.post('/register', validate(receptionistSchema.create), receptionistController.createFirstReceptionist);
receptionistRouter.post('/', validate(receptionistSchema.create), receptionistController.create);
receptionistRouter.get('/:id', receptionistController.findById);

export default receptionistRouter; 