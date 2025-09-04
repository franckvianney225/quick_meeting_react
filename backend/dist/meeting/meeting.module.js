"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const meeting_service_1 = require("./meeting.service");
const meeting_controller_1 = require("./meeting.controller");
const meeting_scheduler_service_1 = require("./meeting-scheduler.service");
const meeting_entity_1 = require("./meeting.entity");
const participant_entity_1 = require("../participant/participant.entity");
const qrcode_module_1 = require("../qrcode/qrcode.module");
const pdf_module_1 = require("../pdf/pdf.module");
const auth_module_1 = require("../auth/auth.module");
const email_module_1 = require("../email/email.module");
let MeetingModule = class MeetingModule {
};
exports.MeetingModule = MeetingModule;
exports.MeetingModule = MeetingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([meeting_entity_1.Meeting, participant_entity_1.Participant]),
            schedule_1.ScheduleModule.forRoot(),
            qrcode_module_1.QrCodeModule,
            pdf_module_1.PdfModule,
            auth_module_1.AuthModule,
            email_module_1.EmailModule
        ],
        controllers: [meeting_controller_1.MeetingController],
        providers: [meeting_service_1.MeetingService, meeting_scheduler_service_1.MeetingSchedulerService],
        exports: [meeting_service_1.MeetingService]
    })
], MeetingModule);
//# sourceMappingURL=meeting.module.js.map