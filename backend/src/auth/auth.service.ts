import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    // Ne pas retourner le mot de passe
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role
    };

    // Mettre à jour la date de dernière connexion
    await this.userService.updateLastLogin(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: new Date().toISOString(), // Retourner la nouvelle date
        avatar: user.avatar, // Ajouter l'avatar
        civility: user.civility // Ajouter la civilité
      }
    };
  }

  async validateToken(payload: { sub: number; email: string; role: string }) {
    const user = await this.userService.findOne(payload.sub);
    
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Utilisateur invalide ou désactivé');
    }

    return user;
  }
}