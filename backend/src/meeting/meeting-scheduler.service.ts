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
      await this.meetingService.checkAndUpdateExpiredMeetings();
      this.logger.log('Vérification automatique terminée avec succès');
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification automatique: ${error.message}`, error.stack);
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
      await this.meetingService.checkAndUpdateExpiredMeetings();
      this.logger.log('Vérification fréquente terminée');
    } catch (error) {
      this.logger.error(`Erreur vérification fréquente: ${error.message}`, error.stack);
    }
  }
}