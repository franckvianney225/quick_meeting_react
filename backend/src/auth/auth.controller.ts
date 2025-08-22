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
    // Le guard JWT injecte l'utilisateur dans la requête
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
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
        return { message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.' };
      }

      // Générer un token de réinitialisation
      const resetToken = await this.userService.generateResetToken(user.id);
      
      // Envoyer l'email de réinitialisation
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      
      return { message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.' };
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      return { message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.' };
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
      
      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw new BadRequestException(
        error instanceof BadRequestException
          ? error.message
          : 'Erreur lors de la réinitialisation du mot de passe'
      );
    }
  }
}