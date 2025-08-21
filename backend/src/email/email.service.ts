import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailConfig)
    private emailConfigRepository: Repository<EmailConfig>,
  ) {}

  async getConfig(): Promise<SMTPConfig | null> {
    const config = await this.emailConfigRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' }
    });
    
    if (!config) return null;

    return {
      server: config.server,
      port: config.port,
      username: config.username,
      password: config.password,
      encryption: config.encryption as 'none' | 'tls' | 'ssl',
      from_email: config.fromEmail,
      from_name: config.fromName,
      timeout: config.timeout,
      max_retries: config.maxRetries,
    };
  }

  async saveConfig(config: SMTPConfig): Promise<SMTPConfig> {
    // Supprimer toute configuration existante
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
      encryption: savedConfig.encryption as 'none' | 'tls' | 'ssl',
      from_email: savedConfig.fromEmail,
      from_name: savedConfig.fromName,
      timeout: savedConfig.timeout,
      max_retries: savedConfig.maxRetries,
    };
  }

  private initializeTransporter(smtpConfig: SMTPConfig) {
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

  async sendEmail(smtpConfig: SMTPConfig, to: string, subject: string, html: string, text?: string) {
    try {
      this.initializeTransporter(smtpConfig);
      
      const info = await this.transporter!.sendMail({
        from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
        to,
        subject,
        text: text || this.htmlToText(html),
        html,
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async testConnection(smtpConfig: SMTPConfig): Promise<{ success: boolean; message: string }> {
    try {
      this.initializeTransporter(smtpConfig);
      await this.transporter!.verify();
      return { success: true, message: 'Connexion SMTP établie avec succès' };
    } catch (error) {
      return { success: false, message: `Erreur de connexion: ${error.message}` };
    }
  }

  private htmlToText(html: string): string {
    // Conversion basique HTML vers texte
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}