import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationError } from 'joi';
import logger from '../utils/logger';

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req[property]) {
      return res.status(400).json({
        message: `Campos inválidos em ${property}`,
        errors: [{ field: property, message: `${property} está vazio ou inválido` }]
      });
    }

    const { error } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: false,
      allowUnknown: true
    });
    
    if (!error) {
      return next();
    }
    
    const errors: ValidationErrorItem[] = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    logger.warn('Validation error:', {
      errors,
      requestData: req[property],
      method: req.method,
      url: req.originalUrl
    });
    
    return res.status(400).json({
      message: 'Validação falhou',
      errors
    });
  };
}; 