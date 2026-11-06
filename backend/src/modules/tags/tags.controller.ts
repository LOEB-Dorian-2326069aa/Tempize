import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste de tous les centres d’intérêt disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des tags' })
  async findAll(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }
}
