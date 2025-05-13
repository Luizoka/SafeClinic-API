import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../models/user.entity';
import logger, { auditLog } from '../utils/logger';

const userRepository = AppDataSource.getRepository(User);

// Interface para login
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para resposta de autenticação
interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  token: string;
  refreshToken: string;
}

// Serviço de autenticação
export class AuthService {
  // Login para qualquer tipo de usuário
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Buscar usuário pelo email
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar status do usuário
      if (!user.status) {
        throw new Error('Usuário está desativado. Entre em contato com o administrador.');
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Senha inválida');
      }

      // Atualizar último login
      user.last_login = new Date();
      await userRepository.save(user);

      // Gerar tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Registrar log de auditoria para login
      auditLog('USER_LOGIN', user.id, { email: user.email, role: user.role });

      // Retornar resposta
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('Erro no login:', { error });
      throw error;
    }
  }

  // Gerar token JWT
  private generateToken(user: User): string {
    try {
      const secret = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
      const jwtExpiration = process.env.JWT_EXPIRATION || '24h';

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      return jwt.sign(payload, secret);
    } catch (error) {
      logger.error('Erro ao gerar token:', { error });
      throw new Error('Falha ao gerar token de autenticação');
    }
  }

  // Gerar refresh token
  private generateRefreshToken(user: User): string {
    try {
      const secret = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
      const jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

      const payload = {
        id: user.id,
        tokenType: 'refresh'
      };

      return jwt.sign(payload, secret);
    } catch (error) {
      logger.error('Erro ao gerar refresh token:', { error });
      throw new Error('Falha ao gerar refresh token');
    }
  }

  // Renovar token usando refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const secret = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
      
      // Verificar o refresh token
      // @ts-ignore
      const decoded = jwt.verify(refreshToken, secret) as {
        id: string;
        tokenType: string;
      };

      // Verificar se é um refresh token
      if (decoded.tokenType !== 'refresh') {
        throw new Error('Token inválido');
      }

      // Buscar usuário
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user || !user.status) {
        throw new Error('Usuário não encontrado ou desativado');
      }

      // Gerar novo token
      const newToken = this.generateToken(user);

      // Registrar log de auditoria
      auditLog('TOKEN_REFRESH', user.id, { role: user.role });

      return { token: newToken };
    } catch (error) {
      logger.error('Erro ao renovar token:', { error });
      throw new Error('Erro ao renovar token de acesso');
    }
  }
} 