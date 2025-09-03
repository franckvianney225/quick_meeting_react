
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
  
  async sendInvitationEmail(email: string, name: string, activationToken: string): Promise<void> {
    const config = await this.getConfig();
    if (!config) {
      throw new Error('Configuration SMTP non trouvée');
    }

    const activationLink = `${process.env.FRONTEND_URL || 'http://164.160.40.182:3000'}/activate-account?token=${activationToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>QuickMeeting</h1>
            <p>Gestion de réunions simplifiée</p>
          </div>
          <div class="content">
            <h2>Bonjour ${name},</h2>
            <p>Vous avez été invité à rejoindre la plateforme QuickMeeting.</p>
            <p>Pour activer votre compte et définir votre mot de passe, cliquez sur le bouton ci-dessous :</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" class="button">Activer mon compte</a>
            </p>
            
            <p>Ce lien d'activation expirera dans 24 heures.</p>
            
            <p>Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${activationLink}
            </p>
            
            <p>Cordialement,<br>L'équipe QuickMeeting</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Bonjour ${name},
      
      Vous avez été invité à rejoindre la plateforme QuickMeeting.
      
      Pour activer votre compte et définir votre mot de passe, cliquez sur le lien suivant :
      ${activationLink}
      
      Ce lien d'activation expirera dans 24 heures.
      
      Cordialement,
      L'équipe QuickMeeting
    `;

    try {
      await this.sendEmail(config, email, 'Invitation à rejoindre QuickMeeting', htmlContent, textContent);
      this.logger.log(`Email d'invitation envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email d'invitation à ${email}:`, error);
      throw new Error('Erreur lors de l\'envoi de l\'email d\'invitation');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const config = await this.getConfig();
    if (!config) {
      throw new Error('Configuration SMTP non trouvée');
    }

    const resetLink = `${process.env.FRONTEND_URL || 'http://164.160.40.182:3000'}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>QuickMeeting</h1>
            <p>Réinitialisation de mot de passe</p>
          </div>
          <div class="content">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte QuickMeeting.</p>
            
            <div class="warning">
              <strong>⚠️ Important :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
            </div>
            
            <p>Pour définir un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            
            <p>Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${resetLink}
            </p>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
            
            <p>Cordialement,<br>L'équipe QuickMeeting</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Réinitialisation de votre mot de passe

      Vous avez demandé à réinitialiser votre mot de passe pour votre compte QuickMeeting.

      Important : Ce lien expirera dans 1 heure pour des raisons de sécurité.

      Pour définir un nouveau mot de passe, cliquez sur le lien suivant :
      ${resetLink}

      Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.

      Cordialement,
      L'équipe QuickMeeting
    `;

    try {
      await this.sendEmail(config, email, 'Réinitialisation de votre mot de passe QuickMeeting', htmlContent, textContent);
      this.logger.log(`Email de réinitialisation envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${email}:`, error);
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  async sendBulkEmails(smtpConfig: SMTPConfig, emails: string[], subject: string, html: string, text?: string) {
    try {
      this.initializeTransporter(smtpConfig);
      
      const results = [];
      for (const email of emails) {
        try {
          const info = await this.transporter!.sendMail({
            from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
            to: email,
            subject,
            text: text || this.htmlToText(html),
            html,
          });
          
          results.push({ email, success: true, messageId: info.messageId });
          this.logger.log(`Email sent to ${email}: ${info.messageId}`);
          
          // Petite pause pour éviter de surcharger le serveur SMTP
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          results.push({ email, success: false, error: error.message });
          this.logger.error(`Failed to send email to ${email}: ${error.message}`);
        }
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Failed to send bulk emails: ${error.message}`);
      throw error;
    }
  }

  async sendParticipantsEmail(emails: string[], subject: string, message: string): Promise<{ success: boolean; results: Array<{ email: string; success: boolean; messageId?: string; error?: string }> }> {
    const config = await this.getConfig();
    if (!config) {
      throw new Error('Configuration SMTP non trouvée');
    }

    // Utiliser le message brut sans template
    const htmlContent = message.replace(/\n/g, '<br>');
    const textContent = message;

    try {
      const results = await this.sendBulkEmails(config, emails, subject, htmlContent, textContent);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      this.logger.log(`Bulk email sending completed: ${successCount} success, ${failureCount} failures`);
      
      return {
        success: failureCount === 0,
        results
      };
    } catch (error) {
      this.logger.error('Error sending bulk emails to participants:', error);
      throw new Error('Erreur lors de l\'envoi des emails aux participants');
    }
  }
}