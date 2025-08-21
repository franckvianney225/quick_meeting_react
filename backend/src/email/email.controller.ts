import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { EmailService, SMTPConfig } from './email.service';

interface TestEmailBody {
  smtpConfig: SMTPConfig;
  to: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('config')
  async getConfig() {
    const config = await this.emailService.getConfig();
    return { config };
  }

  @Put('config')
  async saveConfig(@Body() config: SMTPConfig) {
    const savedConfig = await this.emailService.saveConfig(config);
    return { config: savedConfig, message: 'Configuration sauvegardée avec succès' };
  }

  @Post('test')
  async testEmail(@Body() body: TestEmailBody) {
    const testHtml = `
      <h1>Test d'email SMTP</h1>
      <p>Ceci est un email de test envoyé depuis votre application Quick Meeting.</p>
      <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
      <p>Configuration SMTP testée avec succès !</p>
    `;

    return await this.emailService.sendEmail(
      body.smtpConfig,
      body.to,
      'Test SMTP - Quick Meeting',
      testHtml
    );
  }

  @Post('test-connection')
  async testConnection(@Body() body: { smtpConfig: SMTPConfig }) {
    return await this.emailService.testConnection(body.smtpConfig);
  }
}