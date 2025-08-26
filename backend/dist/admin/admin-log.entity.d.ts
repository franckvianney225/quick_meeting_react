export declare class AdminLog {
    id: number;
    userId: number;
    userEmail: string;
    action: string;
    resourceType: string;
    resourceId?: number;
    details: Record<string, unknown>;
    ipAddress?: string;
    timestamp: Date;
}
