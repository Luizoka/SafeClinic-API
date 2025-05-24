import { AppDataSource } from '../database/data-source';
import { Notification } from '../models/notification.entity';
import logger from '../utils/logger';

const notificationRepository = AppDataSource.getRepository(Notification);

export class NotificationService {
  async findAll(userId: string, page: number = 1, limit: number = 10) {
    try {
      const [notifications, total] = await notificationRepository.findAndCount({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit
      });

      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Erro ao buscar notificações:', { error, userId });
      throw new Error('Erro ao buscar notificações');
    }
  }

  async markAsRead(id: string, userId: string) {
    try {
      const notification = await notificationRepository.findOne({
        where: { id, user_id: userId }
      });

      if (!notification) {
        throw new Error('Notificação não encontrada');
      }

      notification.read = true;
      await notificationRepository.save(notification);

      return notification;
    } catch (error) {
      logger.error('Erro ao marcar notificação como lida:', { error, notificationId: id, userId });
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      await notificationRepository.update(
        { user_id: userId, read: false },
        { read: true }
      );

      return { message: 'Todas as notificações foram marcadas como lidas' };
    } catch (error) {
      logger.error('Erro ao marcar todas as notificações como lidas:', { error, userId });
      throw new Error('Erro ao marcar notificações como lidas');
    }
  }
} 