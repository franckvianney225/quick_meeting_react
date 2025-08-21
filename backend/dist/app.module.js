"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const meeting_entity_1 = require("./meeting/meeting.entity");
const entreprise_entity_1 = require("./entreprise/entreprise.entity");
const participant_entity_1 = require("./participant/participant.entity");
const user_entity_1 = require("./user/user.entity");
const organization_entity_1 = require("./organization/organization.entity");
const email_config_entity_1 = require("./email/email-config.entity");
const meeting_module_1 = require("./meeting/meeting.module");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const organization_module_1 = require("./organization/organization.module");
const participant_module_1 = require("./participant/participant.module");
const email_module_1 = require("./email/email.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT || '5432'),
                    username: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    entities: [meeting_entity_1.Meeting, entreprise_entity_1.Entreprise, participant_entity_1.Participant, user_entity_1.User, organization_entity_1.OrganizationSettings, email_config_entity_1.EmailConfig],
                    synchronize: process.env.NODE_ENV !== 'production',
                    logging: process.env.NODE_ENV === 'development',
                })
            }),
            meeting_module_1.MeetingModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            organization_module_1.OrganizationModule,
            participant_module_1.ParticipantModule,
            email_module_1.EmailModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map