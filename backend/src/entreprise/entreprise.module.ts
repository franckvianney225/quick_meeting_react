import { Module } from '@nestjs/common';
import { EntrepriseService } from './entreprise.service';
import { EntrepriseController } from './entreprise.controller';

@Module({
  controllers: [EntrepriseController],
  providers: [EntrepriseService],
  exports: [EntrepriseService]
})
export class EntrepriseModule {}