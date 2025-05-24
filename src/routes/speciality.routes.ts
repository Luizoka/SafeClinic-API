import { Router } from 'express';
import { SpecialityController } from '../controllers/speciality.controller';

const specialityRouter = Router();
const controller = new SpecialityController();

specialityRouter.get('/', controller.findAll.bind(controller));
specialityRouter.get('/:id', controller.findById.bind(controller));
specialityRouter.post('/', controller.create.bind(controller));
specialityRouter.put('/:id', controller.update.bind(controller));
specialityRouter.delete('/:id', controller.delete.bind(controller));

export default specialityRouter;
