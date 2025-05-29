import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post()
  create(@Body() createAutomationDto: CreateAutomationDto) {
    return this.automationService.create(createAutomationDto);
  }

  @Get()
  findAll() {
    return this.automationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.automationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAutomationDto: UpdateAutomationDto,
  ) {
    return this.automationService.update(+id, updateAutomationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.automationService.remove(+id);
  }
}
