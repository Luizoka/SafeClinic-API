import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Speciality } from '../models/speciality.entity';

const specialityRepo = AppDataSource.getRepository(Speciality);

export class SpecialityController {
  /**
   * @swagger
   * /specialities:
   *   get:
   *     tags: [Specialities]
   *     summary: Lista todas as especialidades
   *     responses:
   *       200:
   *         description: Lista de especialidades
   */
  async findAll(req: Request, res: Response) {
    const specialities = await specialityRepo.find();
    res.json(specialities);
  }

  /**
   * @swagger
   * /specialities/{id}:
   *   get:
   *     tags: [Specialities]
   *     summary: Busca especialidade por ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Especialidade encontrada
   *       404:
   *         description: Especialidade não encontrada
   */
  async findById(req: Request, res: Response) {
    const speciality = await specialityRepo.findOne({ where: { id: req.params.id } });
    if (!speciality) return res.status(404).json({ message: 'Especialidade não encontrada' });
    res.json(speciality);
  }

  /**
   * @swagger
   * /specialities:
   *   post:
   *     tags: [Specialities]
   *     summary: Cria uma nova especialidade
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: Especialidade criada
   *       409:
   *         description: Especialidade já existe
   */
  async create(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });
    const exists = await specialityRepo.findOne({ where: { name } });
    if (exists) return res.status(409).json({ message: 'Especialidade já existe' });
    const speciality = specialityRepo.create({ name });
    await specialityRepo.save(speciality);
    res.status(201).json(speciality);
  }

  /**
   * @swagger
   * /specialities/{id}:
   *   put:
   *     tags: [Specialities]
   *     summary: Atualiza uma especialidade
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Especialidade atualizada
   *       404:
   *         description: Especialidade não encontrada
   */
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;
    const speciality = await specialityRepo.findOne({ where: { id } });
    if (!speciality) return res.status(404).json({ message: 'Especialidade não encontrada' });
    speciality.name = name || speciality.name;
    await specialityRepo.save(speciality);
    res.json(speciality);
  }

  /**
   * @swagger
   * /specialities/{id}:
   *   delete:
   *     tags: [Specialities]
   *     summary: Remove uma especialidade
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Especialidade removida
   *       404:
   *         description: Especialidade não encontrada
   */
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const speciality = await specialityRepo.findOne({ where: { id } });
    if (!speciality) return res.status(404).json({ message: 'Especialidade não encontrada' });
    await specialityRepo.remove(speciality);
    res.status(204).send();
  }
}
