import { Request, Response } from 'express';
import logger from '../utils/logger';
import { AppDataSource } from '../database/data-source';
import { Appointment } from '../models/appointment.entity';
import { Doctor } from '../models/doctor.entity';
import { Patient } from '../models/patient.entity';

export class AppointmentController {
  /**
   * @swagger
   * /appointments:
   *   get:
   *     tags: [Appointments]
   *     summary: Lista todas as consultas (filtradas por perfil)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de itens por página
   *     responses:
   *       200:
   *         description: Lista de consultas paginada
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro no servidor
   */
  async findAll(req: Request, res: Response) {
    try {
      // Placeholder - implementar serviço de consultas
      return res.json({
        data: [],
        metadata: {
          total: 0,
          page: 1,
          limit: 10
        }
      });
    } catch (error) {
      logger.error('Erro ao listar consultas:', { error });
      return res.status(500).json({ message: 'Erro ao buscar consultas' });
    }
  }

  /**
   * @swagger
   * /appointments/{id}:
   *   get:
   *     tags: [Appointments]
   *     summary: Busca consulta pelo ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID da consulta
   *     responses:
   *       200:
   *         description: Dados da consulta
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Acesso proibido
   *       404:
   *         description: Consulta não encontrada
   *       500:
   *         description: Erro no servidor
   */
  async findById(req: Request, res: Response) {
    try {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    } catch (error) {
      logger.error('Erro ao buscar consulta:', { error, id: req.params.id });
      return res.status(500).json({ message: 'Erro ao buscar consulta' });
    }
  }

  /**
   * @swagger
   * /appointments:
   *   post:
   *     tags: [Appointments]
   *     summary: Agenda uma nova consulta
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - doctor_id
   *               - patient_id
   *               - date
   *               - time
   *             properties:
   *               doctor_id:
   *                 type: string
   *               patient_id:
   *                 type: string
   *               date:
   *                 type: string
   *                 format: date
   *               time:
   *                 type: string
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Consulta agendada com sucesso
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       409:
   *         description: Horário não disponível
   *       500:
   *         description: Erro no servidor
   */
  async create(req: Request, res: Response) {
    try {
      const { doctor_id, patient_id, date, time, notes } = req.body;

      // Validação básica
      if (!doctor_id || !patient_id || !date || !time) {
        return res.status(400).json({ message: 'Campos obrigatórios: doctor_id, patient_id, date, time' });
      }

      // Verifique se o médico existe
      const doctorRepo = AppDataSource.getRepository(Doctor);
      const doctor = await doctorRepo.findOne({ where: { user_id: doctor_id } });
      if (!doctor) {
        return res.status(404).json({ message: 'Médico não encontrado' });
      }

      // Verifique se o paciente existe
      const patientRepo = AppDataSource.getRepository(Patient);
      const patient = await patientRepo.findOne({ where: { user_id: patient_id } });
      if (!patient) {
        return res.status(404).json({ message: 'Paciente não encontrado' });
      }

      // Montar datetime da consulta
      const appointment_datetime = new Date(`${date}T${time}:00`);

      // Criar consulta
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const newAppointment = appointmentRepo.create({
        doctor: doctor,
        patient: patient,
        appointment_datetime,
        type: 'presential' as any, // Use the correct AppointmentType value or import the enum and use AppointmentType.PRESENTIAL
        symptoms_description: notes || null
      });

      const savedAppointment = await appointmentRepo.save(newAppointment);

      return res.status(201).json(savedAppointment);
    } catch (error) {
      logger.error('Erro ao agendar consulta:', { error });
      return res.status(500).json({ message: 'Erro ao agendar consulta' });
    }
  }
}