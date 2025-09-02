import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
      if (error instanceof Error && error.message.includes('domaine email n\'est pas autorisé')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
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
      if (error instanceof Error && error.message.includes('domaine email n\'est pas autorisé')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
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
      if (error instanceof Error && error.message.includes('OUPPS VOUS NE POUVEZ PAS SUPPRIMER')) {
        throw new HttpException(
          error.message,
          HttpStatus.CONFLICT // 409 Conflict est approprié pour ce cas
        );
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

  @Get(':id/profile')
  async getProfile(@Param('id', ParseIntPipe) id: number): Promise<User> {
    try {
      return await this.service.findOne(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('non trouvé')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors de la récupération du profil',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/profile')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() profileData: Partial<User>
  ): Promise<User> {
    try {
      // Filtrer les champs autorisés pour la mise à jour du profil
      const allowedFields = ['name', 'email', 'phone', 'department', 'position', 'civility', 'avatar'];
      const filteredData: Record<string, unknown> = {};
      
      for (const key of allowedFields) {
        if (key in profileData && profileData[key as keyof User] !== undefined) {
          filteredData[key] = profileData[key as keyof User];
        }
      }

      return await this.service.update(id, filteredData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('non trouvé')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof Error && error.message.includes('existe déjà')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      if (error instanceof Error && error.message.includes('domaine email n\'est pas autorisé')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      throw new HttpException(
        'Erreur lors de la mise à jour du profil',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `avatar-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Seules les images sont autorisées'), false);
      }
      callback(null, true);
    }
  }))
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ avatarUrl: string }> {
    try {
      if (!file) {
        throw new BadRequestException('Aucun fichier fourni');
      }

      const avatarUrl = `/uploads/avatars/${file.filename}`;
      
      // Mettre à jour l'utilisateur avec le nouveau chemin d'avatar
      await this.service.update(id, { avatar: avatarUrl });
      
      return { avatarUrl };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('non trouvé')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Erreur lors de l\'upload de l\'avatar',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('activate')
  async activateAccount(
    @Body() body: { token: string; password: string }
  ): Promise<{ message: string; user: User }> {
    try {
      const user = await this.service.activateAccount(body.token, body.password);
      return {
        message: 'Compte activé avec succès',
        user
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Token d\'activation invalide')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof Error && error.message.includes('token d\'activation a expiré')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      if (error instanceof Error && error.message.includes('déjà été activé')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Erreur lors de l\'activation du compte',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/resend-invitation')
  async resendInvitation(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    try {
      await this.service.resendInvitation(id);
      return { message: 'Invitation renvoyée avec succès' };
    } catch (error) {
      if (error instanceof Error && error.message.includes('en attente')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      if (error instanceof Error && error.message.includes('Erreur lors de l\'envoi de l\'email')) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw new HttpException(
        'Erreur lors de l\'envoi de l\'invitation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}