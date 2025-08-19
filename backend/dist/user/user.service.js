"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async create(userData) {
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Un utilisateur avec cet email existe déjà');
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
    async update(id, userData) {
        const user = await this.findOne(id);
        if (userData.email && userData.email !== user.email) {
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Un utilisateur avec cet email existe déjà');
            }
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        else {
            delete userData.password;
        }
        Object.assign(user, userData);
        return this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
    async toggleStatus(id) {
        const user = await this.findOne(id);
        user.status = user.status === 'active' ? 'inactive' : 'active';
        return this.userRepository.save(user);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map