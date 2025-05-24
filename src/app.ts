import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import swaggerSpec from './config/swagger';
import { requestLogger } from './middlewares/request-logger.middleware';

// Rotas
import authRouter from './routes/auth.routes';
import patientRouter from './routes/patient.routes';
import doctorRouter from './routes/doctor.routes';
import receptionistRouter from './routes/receptionist.routes';
import appointmentRouter from './routes/appointment.routes';
import scheduleRouter from './routes/schedule.routes';
import notificationRouter from './routes/notification.routes';
import specialityRouter from './routes/speciality.routes';

// Configuração das variáveis de ambiente
dotenv.config();

const app = express();
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Middlewares globais
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(requestLogger);

// Configuração de rate limit
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100')
});
app.use(limiter);

// Rota para verificar se o servidor está rodando
app.get('/', (req, res) => {
  res.json({ message: 'SafeClinic API - Servidor em execução' });
});

// Configuração do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/patients`, patientRouter);
app.use(`${apiPrefix}/doctors`, doctorRouter);
app.use(`${apiPrefix}/receptionists`, receptionistRouter);
app.use(`${apiPrefix}/appointments`, appointmentRouter);
app.use(`${apiPrefix}/schedules`, scheduleRouter);
app.use(`${apiPrefix}/notifications`, notificationRouter);
app.use(`${apiPrefix}/specialities`, specialityRouter);

// Middleware para tratar erros 404
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado' });
});

// Middleware para tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado:', { error: err });
  res.status(500).json({ message: 'Erro interno do servidor' });
});

export default app;
