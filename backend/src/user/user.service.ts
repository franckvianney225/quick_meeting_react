import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OrganizationService } from '../organization/organization.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private organizationService: OrganizationService,
    private emailService: EmailService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.findByEmail(userData.email!);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier si le domaine email est autorisé
    const organizationSettings = await this.organizationService.getCurrentSettings();
    if (organizationSettings?.allowedEmailDomains?.length > 0) {
      const userEmail = userData.email!.toLowerCase();
      const isDomainAllowed = organizationSettings.allowedEmailDomains.some(domain => {
        const domainPattern = domain.startsWith('@') ? domain.toLowerCase() : `@${domain.toLowerCase()}`;
        return userEmail.endsWith(domainPattern);
      });

      if (!isDomainAllowed) {
        throw new ForbiddenException('Le domaine email n\'est pas autorisé pour la création de compte');
      }
    }

    // Générer un token d'activation
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Créer l'utilisateur avec statut "pending" et sans mot de passe
    const user = this.userRepository.create({
      ...userData,
      password: '', // Pas de mot de passe initial
      status: 'pending',
      activation_token: activationToken,
      activation_token_expires: activationTokenExpires
    });

    const savedUser = await this.userRepository.save(user);

    // Envoyer l'email d'invitation
    try {
      await this.emailService.sendInvitationEmail(
        savedUser.email,
        savedUser.name,
        activationToken
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
      // On ne throw pas l'erreur pour ne pas bloquer la création de l'utilisateur
    }

    return savedUser;
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    
    // Si l'email est modifié, vérifier qu'il n'existe pas déjà et que le domaine est autorisé
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Vérifier si le domaine email est autorisé
      const organizationSettings = await this.organizationService.getCurrentSettings();
      if (organizationSettings?.allowedEmailDomains?.length > 0) {
        const userEmail = userData.email.toLowerCase();
        const isDomainAllowed = organizationSettings.allowedEmailDomains.some(domain => {
          const domainPattern = domain.startsWith('@') ? domain.toLowerCase() : `@${domain.toLowerCase()}`;
          return userEmail.endsWith(domainPattern);
        });

        if (!isDomainAllowed) {
          throw new ForbiddenException('Le domaine email n\'est pas autorisé pour la création de compte');
        }
      }
    }

    // Hasher le mot de passe seulement s'il est fourni
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    } else {
      // Ne pas modifier le mot de passe s'il n'est pas fourni
      delete userData.password;
    }

    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    
    // Vérification simplifiée : empêcher la suppression des utilisateurs non-pending
    // car ils ont probablement créé des réunions
    if (user.status !== 'pending') {
      throw new Error('OUPPS VOUS NE POUVEZ PAS SUPPRIMER UN UTILISATEUR QUI A CREE DES REUNIONS');
    }
    
    await this.userRepository.remove(user);
  }

  async toggleStatus(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.status = user.status === 'active' ? 'inactive' : 'active';
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, {
      last_login: new Date()
    });
  }

  async activateAccount(token: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { activation_token: token }
    });

    if (!user) {
      throw new NotFoundException('Token d\'activation invalide');
    }

    if (user.activation_token_expires && user.activation_token_expires < new Date()) {
      throw new ForbiddenException('Le token d\'activation a expiré');
    }

    if (user.status !== 'pending') {
      throw new ForbiddenException('Ce compte a déjà été activé');
    }

    // Hasher le nouveau mot de passe
    user.password = await bcrypt.hash(password, 10);
    user.status = 'active';
    user.activation_token = null;
    user.activation_token_expires = null;

    return this.userRepository.save(user);
  }

  async resendInvitation(userId: number): Promise<void> {
    const user = await this.findOne(userId);
    
    if (user.status !== 'pending') {
      throw new ForbiddenException('Seuls les comptes en attente peuvent recevoir une nouvelle invitation');
    }

    // Générer un nouveau token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.activation_token = activationToken;
    user.activation_token_expires = activationTokenExpires;
    await this.userRepository.save(user);

    // Renvoyer l'email d'invitation
    try {
      await this.emailService.sendInvitationEmail(
        user.email,
        user.name,
        activationToken
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }

  async generateResetToken(userId: number): Promise<string> {
    const user = await this.findOne(userId);
    
    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 heure
    
    user.reset_token = resetToken;
    user.reset_token_expires = resetTokenExpires;
    
    await this.userRepository.save(user);
    
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { reset_token: token }
    });

    if (!user) {
      return { success: false, message: 'Token de réinitialisation invalide' };
    }

    if (user.reset_token_expires && user.reset_token_expires < new Date()) {
      return { success: false, message: 'Le token de réinitialisation a expiré' };
    }

    // Hasher le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.reset_token_expires = null;
    
    await this.userRepository.save(user);

    return { success: true, message: 'Mot de passe réinitialisé avec succès' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.findOne(userId);
    
    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return { success: false, message: 'Le mot de passe actuel est incorrect' };
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return { success: false, message: 'Le nouveau mot de passe doit être différent de l\'ancien' };
    }

    // Hasher le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { success: true, message: 'Mot de passe mis à jour avec succès' };
  }
}