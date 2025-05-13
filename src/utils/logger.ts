import winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// Garante que o diretório de logs existe
const logDir = 'logs';
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const logFileName = process.env.LOG_FILE || 'safeclinic.log';
const logLevel = process.env.LOG_LEVEL || 'info';

// Configuração do logger
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'safeclinic-api' },
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, logFileName) })
  ]
});

// Se não estiver em produção, também loga no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Criando uma interface para os logs de requisição
export interface RequestLogInfo {
  method: string;
  url: string;
  ip: string;
  userId?: string;
  userRole?: string;
  responseStatus?: number;
  responseTime?: number;
}

// Função para registrar logs de auditoria
export const auditLog = (action: string, userId: string, details: Record<string, any>) => {
  logger.info(`AUDIT: ${action}`, {
    userId,
    details,
    type: 'AUDIT'
  });
};

export default logger; 