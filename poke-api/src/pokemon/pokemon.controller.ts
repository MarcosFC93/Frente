import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { GetPokemonAbilitiesDto, PokemonAbilitiesResponseDto } from './dto/pokemon.dto';

@ApiTags('pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os Pokémons',
    description: 'Retorna uma lista com os nomes de todos os Pokémons disponíveis. Utiliza cache para otimizar performance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de Pokémons obtida com sucesso',
    type: [String],
    example: ['bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon'],
  })
  async getAllPokemon(): Promise<string[]> {
    return await this.pokemonService.getAllPokemon();
  }

  @Get(':name')
  @ApiOperation({ 
    summary: 'Buscar habilidades de um Pokémon',
    description: 'Retorna uma lista com todas as habilidades do Pokémon especificado. Utiliza cache para otimizar performance.',
  })
  @ApiParam({
    name: 'name',
    description: 'Nome do Pokémon (case-insensitive)',
    example: 'pikachu',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Habilidades encontradas com sucesso',
    type: [String],
    example: ['static', 'lightning-rod'],
  })
  @ApiNotFoundResponse({
    description: 'Pokémon não encontrado',
    example: {
      statusCode: 404,
      message: 'Pokémon "nonexistent" não encontrado.',
      error: 'Not Found',
    },
  })
  async getPokemonAbilities(@Param('name') name: string): Promise<string[]> {
    return await this.pokemonService.getPokemonAbilities(name);
  }
}
