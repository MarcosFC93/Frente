import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';

@ApiTags('admin')
@Controller('admin/pokemon')
export class PokemonAdminController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Delete('cache/:name')
  @ApiOperation({ summary: 'Limpar cache de um Pokémon específico' })
  @ApiParam({ name: 'name', description: 'Nome do Pokémon' })
  @ApiResponse({ status: 200, description: 'Cache limpo com sucesso' })
  async clearPokemonCache(@Param('name') name: string) {
    const result = await this.pokemonService.clearCache(name);
    return {
      message: `Cache ${result.cleared ? 'cleared' : 'not cleared'} for: ${result.target}`,
      ...result,
    };
  }

  @Delete('cache')
  @ApiOperation({ summary: 'Tentar limpar todo o cache' })
  @ApiResponse({ status: 200, description: 'Operação executada' })
  async clearAllCache() {
    const result = await this.pokemonService.clearCache();
    return {
      message: 'Full cache clear not implemented. Restart application.',
      ...result,
    };
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Estatísticas do cache' })
  @ApiResponse({ status: 200, description: 'Estatísticas do cache' })
  async getCacheStats() {
    return await this.pokemonService.getCacheStats();
  }

  @Post('cache/warmup/:name')
  @ApiOperation({ summary: 'Pré-aquecer cache para um Pokémon' })
  @ApiParam({ name: 'name', description: 'Nome do Pokémon' })
  @ApiResponse({ status: 200, description: 'Cache pré-aquecido' })
  async warmupCache(@Param('name') name: string) {
    const abilities = await this.pokemonService.getPokemonAbilities(name);
    return {
      message: `Cache warmed up for: ${name}`,
      pokemon: name,
      abilities,
    };
  }
}