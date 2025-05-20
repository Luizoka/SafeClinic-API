import Joi from 'joi';

// Validador de CPF
const cpfRegex = /^\d{11}$/;

// Validador de CRM
const crmRegex = /^[A-Z0-9]{4,10}$/i;

// Esquemas de validação para usuários
export const userSchema = {
  // Validação para login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ser um endereço válido',
      'string.empty': 'Email não pode ser vazio',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.empty': 'Senha não pode ser vazia',
      'any.required': 'Senha é obrigatória'
    })
  }),

  // Validação para refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'Refresh token não pode ser vazio',
      'any.required': 'Refresh token é obrigatório'
    })
  })
};

// Esquemas de validação para pacientes
export const patientSchema = {
  // Validação para criação de paciente
  create: Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres',
      'string.empty': 'Nome não pode ser vazio',
      'any.required': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ser um endereço válido',
      'string.empty': 'Email não pode ser vazio',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.empty': 'Senha não pode ser vazia',
      'any.required': 'Senha é obrigatória'
    }),
    cpf: Joi.string().pattern(cpfRegex).required().messages({
      'string.pattern.base': 'CPF deve conter 11 dígitos numéricos',
      'string.empty': 'CPF não pode ser vazio',
      'any.required': 'CPF é obrigatório'
    }),
    phone: Joi.string().allow('', null),
    birth_date: Joi.date().iso().required().messages({
      'date.base': 'Data de nascimento deve ser uma data válida',
      'any.required': 'Data de nascimento é obrigatória'
    }),
    health_insurance: Joi.string().allow('', null),
    emergency_contact: Joi.string().allow('', null),
    blood_type: Joi.string().allow('', null),
    allergies: Joi.string().allow('', null)
  }),

  // Validação para atualização de paciente
  update: Joi.object({
    name: Joi.string().min(3).max(255).messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
    phone: Joi.string().allow('', null),
    birth_date: Joi.date().iso().messages({
      'date.base': 'Data de nascimento deve ser uma data válida'
    }),
    health_insurance: Joi.string().allow('', null),
    emergency_contact: Joi.string().allow('', null),
    blood_type: Joi.string().allow('', null),
    allergies: Joi.string().allow('', null)
  })
};

// Esquemas de validação para médicos
export const doctorSchema = {
  // Validação para criação de médico
  create: Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres',
      'string.empty': 'Nome não pode ser vazio',
      'any.required': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ser um endereço válido',
      'string.empty': 'Email não pode ser vazio',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.empty': 'Senha não pode ser vazia',
      'any.required': 'Senha é obrigatória'
    }),
    cpf: Joi.string().pattern(cpfRegex).required().messages({
      'string.pattern.base': 'CPF deve conter 11 dígitos numéricos',
      'string.empty': 'CPF não pode ser vazio',
      'any.required': 'CPF é obrigatório'
    }),
    phone: Joi.string().allow('', null),
    crm: Joi.string().pattern(crmRegex).required().messages({
      'string.pattern.base': 'CRM deve ser um formato válido',
      'string.empty': 'CRM não pode ser vazio',
      'any.required': 'CRM é obrigatório'
    }),
    speciality_id: Joi.string().uuid().required().messages({
      'string.guid': 'Especialidade deve ser um UUID válido',
      'any.required': 'Especialidade é obrigatória'
    }),
    professional_statement: Joi.string().allow('', null),
    consultation_duration: Joi.number().integer().min(10).max(120).default(30).messages({
      'number.base': 'Duração da consulta deve ser um número',
      'number.integer': 'Duração da consulta deve ser um número inteiro',
      'number.min': 'Duração da consulta deve ser de pelo menos 10 minutos',
      'number.max': 'Duração da consulta deve ser no máximo 120 minutos'
    })
  }),

  // Validação para atualização de médico
  update: Joi.object({
    name: Joi.string().min(3).max(255).messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
    phone: Joi.string().allow('', null),
    speciality_id: Joi.string().uuid(),
    professional_statement: Joi.string().allow('', null),
    consultation_duration: Joi.number().integer().min(10).max(120).messages({
      'number.base': 'Duração da consulta deve ser um número',
      'number.integer': 'Duração da consulta deve ser um número inteiro',
      'number.min': 'Duração da consulta deve ser de pelo menos 10 minutos',
      'number.max': 'Duração da consulta deve ser no máximo 120 minutos'
    })
  })
};

// Esquemas de validação para agendamento
export const appointmentSchema = {
  // Validação para criação de agendamento
  create: Joi.object({
    patient_id: Joi.string().uuid().required().messages({
      'string.guid': 'ID do paciente deve ser um UUID válido',
      'any.required': 'ID do paciente é obrigatório'
    }),
    doctor_id: Joi.string().uuid().required().messages({
      'string.guid': 'ID do médico deve ser um UUID válido',
      'any.required': 'ID do médico é obrigatório'
    }),
    appointment_datetime: Joi.date().iso().greater('now').required().messages({
      'date.base': 'Data da consulta deve ser uma data válida',
      'date.greater': 'Data da consulta deve ser no futuro',
      'any.required': 'Data da consulta é obrigatória'
    }),
    type: Joi.string().valid('online', 'presential').required().messages({
      'any.only': 'Tipo de consulta deve ser online ou presencial',
      'any.required': 'Tipo de consulta é obrigatório'
    }),
    symptoms_description: Joi.string().allow('', null)
  }),

  // Validação para atualização de agendamento
  update: Joi.object({
    appointment_datetime: Joi.date().iso().greater('now').messages({
      'date.base': 'Data da consulta deve ser uma data válida',
      'date.greater': 'Data da consulta deve ser no futuro'
    }),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled', 'absent').messages({
      'any.only': 'Status deve ser scheduled, completed, cancelled ou absent'
    }),
    type: Joi.string().valid('online', 'presential').messages({
      'any.only': 'Tipo de consulta deve ser online ou presential'
    }),
    symptoms_description: Joi.string().allow('', null),
    medical_notes: Joi.string().allow('', null),
    cancellation_reason: Joi.string().allow('', null)
  })
};

// Esquemas de validação para agenda do médico
export const scheduleSchema = {
  // Validação para criação de horário de atendimento
  create: Joi.object({
    doctor_id: Joi.string().uuid().required().messages({
      'string.guid': 'ID do médico deve ser um UUID válido',
      'any.required': 'ID do médico é obrigatório'
    }),
    day_of_week: Joi.number().integer().min(0).max(6).required().messages({
      'number.base': 'Dia da semana deve ser um número',
      'number.integer': 'Dia da semana deve ser um número inteiro',
      'number.min': 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)',
      'number.max': 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)',
      'any.required': 'Dia da semana é obrigatório'
    }),
    start_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Horário de início deve estar no formato HH:MM',
      'any.required': 'Horário de início é obrigatório'
    }),
    end_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Horário de término deve estar no formato HH:MM',
      'any.required': 'Horário de término é obrigatório'
    }),
    is_available: Joi.boolean().default(true)
  }),

  // Validação para criação de bloqueio de horário
  createBlock: Joi.object({
    doctor_id: Joi.string().uuid().required().messages({
      'string.guid': 'ID do médico deve ser um UUID válido',
      'any.required': 'ID do médico é obrigatório'
    }),
    start_datetime: Joi.date().iso().required().messages({
      'date.base': 'Data/hora de início deve ser uma data válida',
      'any.required': 'Data/hora de início é obrigatória'
    }),
    end_datetime: Joi.date().iso().greater(Joi.ref('start_datetime')).required().messages({
      'date.base': 'Data/hora de término deve ser uma data válida',
      'date.greater': 'Data/hora de término deve ser posterior ao início',
      'any.required': 'Data/hora de término é obrigatória'
    }),
    reason: Joi.string().allow('', null)
  })
};

// Esquemas de validação para recepcionista
export const receptionistSchema = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Nome é obrigatório',
      'any.required': 'Nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'string.empty': 'Email é obrigatório',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'string.empty': 'Senha é obrigatória',
      'any.required': 'Senha é obrigatória'
    }),
    cpf: Joi.string().pattern(/^\d{11}$/).required().messages({
      'string.pattern.base': 'CPF deve conter 11 dígitos numéricos',
      'string.empty': 'CPF é obrigatório',
      'any.required': 'CPF é obrigatório'
    }),
    phone: Joi.string().allow('', null).messages({
      'string.base': 'Telefone deve ser uma string'
    }),
    work_shift: Joi.string().valid('morning', 'afternoon', 'night').required().messages({
      'any.only': 'Turno de trabalho deve ser morning, afternoon ou night',
      'string.empty': 'Turno de trabalho é obrigatório',
      'any.required': 'Turno de trabalho é obrigatório'
    })
  })
};