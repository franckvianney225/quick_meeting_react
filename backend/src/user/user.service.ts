import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private organizationService: OrganizationService,
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

    // Hasher le mot de passe
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
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
}