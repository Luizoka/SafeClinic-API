import { Router } from 'express';
import { ReceptionistController } from '../controllers/receptionist.controller';
import { validate } from '../middlewares/validation.middleware';
import { receptionistSchema } from '../utils/validators';
import { authenticate } from '../middlewares/auth.middleware';

const receptionistRouter = Router();
const receptionistController = new ReceptionistController();

/**
 * @swagger
 * tags:
 *   name: Receptionists
 *   description: Gerenciamento de recepcionistas
 */

// Proteger todas as rotas com autenticação
receptionistRouter.use(authenticate);

// Rotas públicas
receptionistRouter.post('/register', validate(receptionistSchema.create), receptionistController.createFirstReceptionist);

// Rotas protegidas
receptionistRouter.get('/', receptionistController.findAll.bind(receptionistController));
receptionistRouter.post('/', validate(receptionistSchema.create), receptionistController.create);
receptionistRouter.get('/:id', receptionistController.findById);

export default receptionistRouter;