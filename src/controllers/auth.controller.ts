import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

const authService = new AuthService();

export class AuthController {
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Realiza login e retorna token JWT
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login bem-sucedido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     email:
   *                       type: string
   *                     name:
   *                       type: string
   *                     role:
   *                       type: string
   *                 token:
   *                   type: string
   *                 refreshToken:
   *                   type: string
   *       401:
   *         description: Credenciais inválidas
   *       500:
   *         description: Erro no servidor
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validação básica
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      const authResponse = await authService.login({ email, password });
      return res.json(authResponse);
    } catch (error: any) {
      logger.error('Erro no login:', { error });

      if (error.message === 'Usuário não encontrado' || error.message === 'Senha inválida') {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      if (error.message === 'Usuário está desativado. Entre em contato com o administrador.') {
        return res.status(403).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Erro ao realizar login' });
    }
  }

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     tags: [Auth]
   *     summary: Renova o token JWT usando refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token renovado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *       401:
   *         description: Refresh token inválido
   *       500:
   *         description: Erro no servidor
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token é obrigatório' });
      }

      const result = await authService.refreshToken(refreshToken);
      return res.json(result);
    } catch (error) {
      logger.error('Erro ao renovar token:', { error });
      return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
    }
  }
} 