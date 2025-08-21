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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const nodemailer = require("nodemailer");
const config_1 = require("@nestjs/config");
const email_config_entity_1 = require("./email-config.entity");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService, emailConfigRepository) {
        this.configService = configService;
        this.emailConfigRepository = emailConfigRepository;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = null;
    }
    async getConfig() {
        const config = await this.emailConfigRepository.findOne({
            where: {},
            order: { createdAt: 'DESC' }
        });
        if (!config)
            return null;
        return {
            server: config.server,
            port: config.port,
            username: config.username,
            password: config.password,
            encryption: config.encryption,
            from_email: config.fromEmail,
            from_name: config.fromName,
            timeout: config.timeout,
            max_retries: config.maxRetries,
        };
    }
    async saveConfig(config) {
        await this.emailConfigRepository.clear();
        const emailConfig = this.emailConfigRepository.create({
            server: config.server,
            port: config.port,
            username: config.username,
            password: config.password,
            encryption: config.encryption,
            fromEmail: config.from_email,
            fromName: config.from_name,
            timeout: config.timeout,
            maxRetries: config.max_retries,
        });
        const savedConfig = await this.emailConfigRepository.save(emailConfig);
        return {
            server: savedConfig.server,
            port: savedConfig.port,
            username: savedConfig.username,
            password: savedConfig.password,
            encryption: savedConfig.encryption,
            from_email: savedConfig.fromEmail,
            from_name: savedConfig.fromName,
            timeout: savedConfig.timeout,
            max_retries: savedConfig.maxRetries,
        };
    }
    initializeTransporter(smtpConfig) {
        this.transporter = nodemailer.createTransport({
            host: smtpConfig.server,
            port: smtpConfig.port,
            secure: smtpConfig.encryption === 'ssl',
            auth: {
                user: smtpConfig.username,
                pass: smtpConfig.password,
            },
            connectionTimeout: (smtpConfig.timeout || 30) * 1000,
        });
    }
    async sendEmail(smtpConfig, to, subject, html, text) {
        try {
            this.initializeTransporter(smtpConfig);
            const info = await this.transporter.sendMail({
                from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
                to,
                subject,
                text: text || this.htmlToText(html),
                html,
            });
            this.logger.log(`Email sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw error;
        }
    }
    async testConnection(smtpConfig) {
        try {
            this.initializeTransporter(smtpConfig);
            await this.transporter.verify();
            return { success: true, message: 'Connexion SMTP établie avec succès' };
        }
        catch (error) {
            return { success: false, message: `Erreur de connexion: ${error.message}` };
        }
    }
    htmlToText(html) {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(email_config_entity_1.EmailConfig)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], EmailService);
//# sourceMappingURL=email.service.js.map