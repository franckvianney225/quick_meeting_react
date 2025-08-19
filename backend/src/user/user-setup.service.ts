import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSetupService implements OnApplicationBootstrap {
  constructor(private readonly userService: UserService) {}

  async onApplicationBootstrap() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    try {
      console.log('🔍 Vérification de l\'existence de l\'administrateur par défaut...');
      
      // Vérifier si un administrateur existe déjà
      const adminEmail = 'admin@ministere.gov';
      const existingAdmin = await this.userService.findByEmail(adminEmail);
      
      if (existingAdmin) {
        console.log('✅ Administrateur par défaut existe déjà');
        return;
      }

      // Créer l'administrateur par défaut
      const defaultAdmin = {
        name: 'Administrateur Système',
        email: adminEmail,
        password: 'admin123', // Mot de passe temporaire - à changer immédiatement
        role: 'Admin',
        status: 'active' as const
      };

      await this.userService.create(defaultAdmin);
      
      console.log('✅ Administrateur par défaut créé avec succès');
      console.log('📧 Email: admin@ministere.gov');
      console.log('🔑 Mot de passe: admin123');
      console.log('⚠️  IMPORTANT: Changez le mot de passe immédiatement après la première connexion!');
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'administrateur par défaut:', error.message);
    }
  }
}