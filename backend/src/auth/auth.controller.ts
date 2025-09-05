import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, BadRequestException, Put } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/user.entity';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives par minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      return this.authService.login(user, req);
    } catch (error) {
      // Log des tentatives échouées pour surveillance
      console.error(`Tentative de connexion échouée pour ${loginDto.email}:`, error.message);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<User> {
    const user = req.user as User;
    console.log('=== PROFILE ENDPOINT ===');
    console.log('User from request:', user);
    console.log('User name:', user?.name);
    console.log('User civility:', user?.civility);
    console.log('========================');
    return user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: { email: string }) {
    try {
      const user = await this.userService.findByEmail(forgotPasswordDto.email);
      
      if (!user) {
        return {
          success: false,
          message: 'Desole, cet email nest pas enregistre dans notre systeme.'
        };
      }

      if (user.status !== 'active') {
        return {
          success: false,
          message: 'Votre compte nest pas encore active. Veuillez verifier vos emails pour le lien dactivation.'
        };
      }

      const resetToken = await this.userService.generateResetToken(user.id);
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      
      return {
        success: true,
        message: 'Un lien de reinitialisation a ete envoye a votre adresse email.'
      };
    } catch (error) {
      console.error('Erreur lors de la demande de reinitialisation:', error);
      return {
        success: false,
        message: 'Une erreur est survenue lors de lenvoi du lien de reinitialisation.'
      };
    }
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: { currentPassword: string; newPassword: string }
  ) {
    try {
      const user = req.user as User;
      
      const result = await this.userService.changePassword(
        user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword
      );

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      return { message: result.message };
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw new BadRequestException(
        error instanceof BadRequestException
          ? error.message
          : 'Erreur lors du changement de mot de passe'
      );
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: { token: string; password: string }) {
    try {
      const result = await this.userService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
      
      if (!result.success) {
        throw new BadRequestException(result.message);
      }
      
      return { message: 'Mot de passe reinitialise avec succes' };
    } catch (error) {
      console.error('Erreur lors de la reinitialisation du mot de passe:', error);
      throw new BadRequestException(
        error instanceof BadRequestException
          ? error.message
          : 'Erreur lors de la reinitialisation du mot de passe'
      );
    }
  }

  @Post('admin/reset-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async adminResetPassword(@Body() adminResetPasswordDto: { email: string }) {
    try {
      const user = await this.userService.findByEmail(adminResetPasswordDto.email);
      
      if (!user) {
        throw new BadRequestException('Utilisateur non trouvé');
      }

      if (user.status !== 'active') {
        throw new BadRequestException('Le compte de l\'utilisateur n\'est pas actif');
      }

      const resetToken = await this.userService.generateResetToken(user.id);
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      
      return {
        success: true,
        message: `Email de réinitialisation envoyé avec succès à ${user.email}`
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation par admin:', error);
      throw new BadRequestException(
        error instanceof BadRequestException
          ? error.message
          : 'Erreur lors de l\'envoi de l\'email de réinitialisation'
      );
    }
  }
}