import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
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
}