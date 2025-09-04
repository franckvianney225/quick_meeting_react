import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MeetingService } from './meeting.service';

@Injectable()
export class MeetingSchedulerService {
  private readonly logger = new Logger(MeetingSchedulerService.name);

  constructor(private readonly meetingService: MeetingService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleMeetingStatusChecks() {
    this.logger.log('Démarrage de la vérification automatique des statuts de réunion');

    try {
      // Vérifier et envoyer les notifications d'expiration imminente
      await this.sendExpirationReminders();

      // Vérifier et mettre à jour les réunions expirées
      await this.meetingService.checkAndUpdateExpiredMeetings();

      this.logger.log('Vérification automatique terminée avec succès');
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification automatique: ${error.message}`, error.stack);
    }
  }

  /**
   * Envoie des rappels aux créateurs de réunions dont la fin approche dans les 3 heures
   */
  async sendExpirationReminders(): Promise<void> {
    try {
      const meetings = await this.meetingService.findAll();
      const activeMeetings = meetings.filter(m => m.status === 'active');
      const now = new Date();

      let notificationsSent = 0;

      for (const meeting of activeMeetings) {
        let endDate: Date;

        if (meeting.meetingEndDate) {
          // Utiliser la date de fin définie
          endDate = new Date(meeting.meetingEndDate);
        } else if (meeting.startDate) {
          // Calculer la date de fin comme lendemain de startDate à la même heure
          endDate = new Date(meeting.startDate);
          endDate.setDate(endDate.getDate() + 1);
        } else {
          // Pas de date disponible, ignorer
          continue;
        }

        // Vérifier si la fin est dans 3 heures (± 30 minutes pour éviter les spam)
        const threeHoursEarlier = new Date(endDate.getTime() - 3 * 60 * 60 * 1000);
        const threeHoursLater = new Date(endDate.getTime() - 3 * 60 * 60 * 1000 + 30 * 60 * 1000);

        if (now >= threeHoursEarlier && now <= threeHoursLater && endDate > now) {
          this.logger.log(`Envoi d'une notification pour la réunion ${meeting.title} (ID: ${meeting.id})`);
          await this.meetingService.sendMeetingExpirationNotification(meeting, endDate);
          notificationsSent++;
        }
      }

      if (notificationsSent > 0) {
        this.logger.log(`${notificationsSent} notification(s) d'expiration envoyée(s)`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi des rappels d'expiration: ${error.message}`, error.stack);
    }
  }

  // Méthode de développement pour exécuter plus fréquemment (toutes les 5 minutes)
  @Cron('0 */5 * * * *')
  async handleFrequentMeetingStatusChecks() {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (!isDevelopment) {
      return;
    }

    this.logger.log('Vérification fréquente (développement) démarrée');

    try {
      // Vérifier et envoyer les notifications d'expiration imminente
      await this.sendExpirationReminders();

      // Vérifier et mettre à jour les réunions expirées
      await this.meetingService.checkAndUpdateExpiredMeetings();

      this.logger.log('Vérification fréquente terminée');
    } catch (error) {
      this.logger.error(`Erreur vérification fréquente: ${error.message}`, error.stack);
    }
  }
}