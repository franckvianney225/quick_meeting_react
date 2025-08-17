export declare class CreateMeetingDto {
    title: string;
    description?: string;
    status: 'active' | 'completed' | 'inactive';
    location: string;
    max_participants?: number;
    start_date: string;
}
