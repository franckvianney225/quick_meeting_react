import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  status: 'active' | 'completed' | 'inactive';

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  max_participants?: number;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  meetingstartdate?: string;

  @IsOptional()
  @IsDateString()
  meetingenddate?: string;
}