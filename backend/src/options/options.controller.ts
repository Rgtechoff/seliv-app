import { Controller, Get } from '@nestjs/common';
import { OPTIONS_CATALOG } from './options.catalog';

@Controller('options')
export class OptionsController {
  @Get()
  getOptions() {
    return { data: OPTIONS_CATALOG };
  }
}
