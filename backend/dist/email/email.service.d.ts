import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from './email-config.entity';
export interface SMTPConfig {
    server: string;
    port: number;
    username: string;
    password: string;
    encryption: 'none' | 'tls' | 'ssl';
    from_email: string;
    from_name: string;
    timeout?: number;
    max_retries?: number;
}
export declare class EmailService {
    private configService;
    private emailConfigRepository;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService, emailConfigRepository: Repository<EmailConfig>);
    getConfig(): Promise<SMTPConfig | null>;
    saveConfig(config: SMTPConfig): Promise<SMTPConfig>;
    private initializeTransporter;
    sendEmail(smtpConfig: SMTPConfig, to: string, subject: string, html: string, text?: string): Promise<{
        success: boolean;
        messageId: any;
    }>;
    testConnection(smtpConfig: SMTPConfig): Promise<{
        success: boolean;
        message: string;
    }>;
    private htmlToText;
    sendInvitationEmail(email: string, name: string, activationToken: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
}
