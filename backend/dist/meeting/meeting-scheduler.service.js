"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MeetingSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const meeting_service_1 = require("./meeting.service");
let MeetingSchedulerService = MeetingSchedulerService_1 = class MeetingSchedulerService {
    constructor(meetingService) {
        this.meetingService = meetingService;
        this.logger = new common_1.Logger(MeetingSchedulerService_1.name);
    }
    async handleMeetingStatusChecks() {
        this.logger.log('Démarrage de la vérification automatique des statuts de réunion');
        try {
            await this.sendExpirationReminders();
            await this.meetingService.checkAndUpdateExpiredMeetings();
            this.logger.log('Vérification automatique terminée avec succès');
        }
        catch (error) {
            this.logger.error(`Erreur lors de la vérification automatique: ${error.message}`, error.stack);
        }
    }
    async sendExpirationReminders() {
        try {
            const meetings = await this.meetingService.findAll();
            const activeMeetings = meetings.filter(m => m.status === 'active');
            const now = new Date();
            let notificationsSent = 0;
            for (const meeting of activeMeetings) {
                let endDate;
                if (meeting.meetingEndDate) {
                    endDate = new Date(meeting.meetingEndDate);
                }
                else if (meeting.startDate) {
                    endDate = new Date(meeting.startDate);
                    endDate.setDate(endDate.getDate() + 1);
                }
                else {
                    continue;
                }
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
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'envoi des rappels d'expiration: ${error.message}`, error.stack);
        }
    }
    async handleFrequentMeetingStatusChecks() {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (!isDevelopment) {
            return;
        }
        this.logger.log('Vérification fréquente (développement) démarrée');
        try {
            await this.sendExpirationReminders();
            await this.meetingService.checkAndUpdateExpiredMeetings();
            this.logger.log('Vérification fréquente terminée');
        }
        catch (error) {
            this.logger.error(`Erreur vérification fréquente: ${error.message}`, error.stack);
        }
    }
};
exports.MeetingSchedulerService = MeetingSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MeetingSchedulerService.prototype, "handleMeetingStatusChecks", null);
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MeetingSchedulerService.prototype, "handleFrequentMeetingStatusChecks", null);
exports.MeetingSchedulerService = MeetingSchedulerService = MeetingSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meeting_service_1.MeetingService])
], MeetingSchedulerService);
//# sourceMappingURL=meeting-scheduler.service.js.map