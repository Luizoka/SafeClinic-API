import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user.entity';
import logger, { auditLog } from '../utils/logger';

// Extendendo a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Middleware de autenticação
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.error('JWT_SECRET não configurado no ambiente');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expirado' });
        }
        
        return res.status(401).json({ message: 'Token inválido' });
      }
      
      req.user = decoded as { id: string; email: string; role: UserRole };

      // Log de auditoria para acesso
      auditLog('AUTH_ACCESS', req.user.id, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      });

      return next();
    });
  } catch (error) {
    logger.error('Erro de autenticação:', { error });
    return res.status(500).json({ message: 'Erro interno de autenticação' });
  }
};

// Middleware de autorização baseado em roles
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      // Log de auditoria para tentativa de acesso não autorizado
      auditLog('AUTH_UNAUTHORIZED_ATTEMPT', req.user.id, {
        method: req.method,
        url: req.originalUrl,
        requiredRoles: roles,
        userRole: req.user.role
      });

      return res.status(403).json({
        message: 'Acesso negado. Você não tem permissão para esta operação.'
      });
    }

    next();
  };
}; 