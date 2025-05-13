import { Request, Response, NextFunction } from 'express';
import logger, { RequestLogInfo } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Registrar o início da requisição
  const logInfo: RequestLogInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    userRole: req.user?.role
  };

  // Capturar o status de resposta
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    const responseTime = Date.now() - startTime;
    
    logInfo.responseStatus = res.statusCode;
    logInfo.responseTime = responseTime;

    // Log baseado no status code
    if (res.statusCode >= 500) {
      logger.error('Request error', logInfo);
    } else if (res.statusCode >= 400) {
      logger.warn('Request warning', logInfo);
    } else {
      logger.info('Request completed', logInfo);
    }

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
}; 