import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { userSchema } from '../utils/validators';

const authRouter = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticação
 */

// Rotas de autenticação
authRouter.post('/login', validate(userSchema.login), authController.login);
authRouter.post('/refresh-token', validate(userSchema.refreshToken), authController.refreshToken);

export default authRouter; 