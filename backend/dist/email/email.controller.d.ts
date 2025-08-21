import { EmailService, SMTPConfig } from './email.service';
interface TestEmailBody {
    smtpConfig: SMTPConfig;
    to: string;
}
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    getConfig(): Promise<{
        config: SMTPConfig;
    }>;
    saveConfig(config: SMTPConfig): Promise<{
        config: SMTPConfig;
        message: string;
    }>;
    testEmail(body: TestEmailBody): Promise<{
        success: boolean;
        messageId: any;
    }>;
    testConnection(body: {
        smtpConfig: SMTPConfig;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
