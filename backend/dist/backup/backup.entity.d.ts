export declare class Backup {
    id: number;
    name: string;
    filename: string;
    path: string;
    size: number;
    status: 'pending' | 'success' | 'failed';
    type: 'manual' | 'automatic';
    description: string;
    errorMessage: string;
    createdAt: Date;
    completedAt: Date;
}
