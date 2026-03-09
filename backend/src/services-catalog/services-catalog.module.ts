import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceItem } from './entities/service-item.entity';
import { ServicesCatalogService } from './services-catalog.service';
import { ServicesCatalogController } from './services-catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceItem])],
  controllers: [ServicesCatalogController],
  providers: [ServicesCatalogService],
  exports: [ServicesCatalogService],
})
export class ServicesCatalogModule {}
