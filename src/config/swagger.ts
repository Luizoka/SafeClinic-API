import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const apiPrefix = process.env.API_PREFIX || '/api/v1';
const port = process.env.PORT || 3000;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SafeClinic API',
      version: '1.0.0',
      description: 'API para gerenciamento de agendamentos de consultas médicas',
      contact: {
        name: 'Suporte SafeClinic',
        email: 'suporte@safeclinic.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}${apiPrefix}`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticação'
      },
      {
        name: 'Patients',
        description: 'Operações para pacientes'
      },
      {
        name: 'Doctors',
        description: 'Operações para médicos'
      },
      {
        name: 'Receptionists',
        description: 'Operações para recepcionistas'
      },
      {
        name: 'Appointments',
        description: 'Gerenciamento de consultas'
      },
      {
        name: 'Schedules',
        description: 'Gerenciamento de agendas dos médicos'
      },
      {
        name: 'Notifications',
        description: 'Gestão de notificações'
      },
      {
        name: 'Specialities',
        description: 'CRUD de especialidades médicas'
      }
    ]
  },
  apis: [
    path.resolve(__dirname, '../controllers/*.ts'),
    path.resolve(__dirname, '../routes/*.ts'),
    path.resolve(__dirname, '../models/*.ts')
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;