import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private organizationService: OrganizationService,
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

    // Vérifier si le domaine email est autorisé
    const organizationSettings = await this.organizationService.getCurrentSettings();
    console.log('=== DOMAIN VALIDATION DEBUG ===');
    console.log('Organization settings:', organizationSettings);
    console.log('User email:', email);
    
    if (organizationSettings && organizationSettings.allowedEmailDomains && organizationSettings.allowedEmailDomains.length > 0) {
      const userDomain = email.split('@')[1];
      console.log('User domain:', userDomain);
      console.log('Allowed domains:', organizationSettings.allowedEmailDomains);
      
      // Vérifier si le domaine est autorisé (avec ou sans @)
      const isDomainAllowed = organizationSettings.allowedEmailDomains.some(allowedDomain => {
        // Supprimer le @ du début si présent
        const cleanDomain = allowedDomain.startsWith('@') ? allowedDomain.substring(1) : allowedDomain;
        return cleanDomain === userDomain;
      });
      
      console.log('Is domain allowed:', isDomainAllowed);
      
      if (!isDomainAllowed) {
        console.log('Domain not allowed, throwing error');
        throw new UnauthorizedException('Votre domaine email n\'est pas autorisé pour la connexion');
      } else {
        console.log('Domain is allowed, proceeding with login');
      }
    } else {
      console.log('No domain restrictions or no settings found');
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