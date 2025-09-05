import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { SecurityController } from './security.controller';
import { EmailModule } from '../email/email.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    UserModule,
    OrganizationModule,
    EmailModule,
    SessionModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || process.env.NODE_ENV === 'production' ? 'CHANGE_THIS_IN_PRODUCTION' : 'development-secret-key-temp', // Toujours configurer la variable d'environnement
      signOptions: { expiresIn: '1h' }, // Réduire l'expiration à 1h pour plus de sécurité
    }),
  ],
  controllers: [AuthController, SecurityController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}