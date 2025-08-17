export declare class PdfService {
    generateMeetingQRPDF(url: string, title: string, qrConfig?: {
        color?: {
            dark?: string;
            light?: string;
        };
        size?: number;
    }): Promise<Buffer>;
}
