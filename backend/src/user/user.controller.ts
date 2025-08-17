import { Controller, Get, Post, Body } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() userData: User): Promise<User> {
    return this.service.create(userData);
  }
}