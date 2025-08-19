import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.service.findAll();
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des utilisateurs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    try {
      return await this.service.findOne(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('non trouvé')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors de la récupération de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    try {
      return await this.service.create(userData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('existe déjà')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Erreur lors de la création de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: Partial<User>
  ): Promise<User> {
    try {
      return await this.service.update(id, userData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('non trouvé')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof Error && error.message.includes('existe déjà')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Erreur lors de la mise à jour de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      await this.service.remove(id);
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      if (error instanceof Error && error.message.includes('non trouvé')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors de la suppression de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<User> {
    try {
      return await this.service.toggleStatus(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('non trouvé')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors du changement de statut',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}