import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { GetPokemonAbilitiesDto, PokemonAbilitiesResponseDto, AbilityDetailDto } from './dto/pokemon.dto';

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
    description: 'Retorna as habilidades e sprite do Pokémon especificado. Utiliza cache para otimizar performance.',
  })
  @ApiParam({
    name: 'name',
    description: 'Nome do Pokémon (case-insensitive)',
    example: 'pikachu',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do Pokémon encontrados com sucesso',
    type: PokemonAbilitiesResponseDto,
    example: {
      abilities: ['static', 'lightning-rod'],
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    },
  })
  @ApiNotFoundResponse({
    description: 'Pokémon não encontrado',
    example: {
      statusCode: 404,
      message: 'Pokémon "nonexistent" não encontrado.',
      error: 'Not Found',
    },
  })
  async getPokemonAbilities(@Param('name') name: string): Promise<PokemonAbilitiesResponseDto> {
    const data = await this.pokemonService.getPokemonAbilities(name);
    return {
      abilities: data.abilities,
      sprite: data.sprite,
    };
  }

  @Get('ability/:name')
  @ApiOperation({ 
    summary: 'Get ability details',
    description: 'Returns detailed description of an ability in English.',
  })
  @ApiParam({
    name: 'name',
    description: 'Ability name (case-insensitive)',
    example: 'static',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Ability details found successfully',
    type: AbilityDetailDto,
    example: {
      name: 'static',
      effect: 'Whenever this Pokémon is hit by a contact move, the attacking Pokémon has a 30% chance of being paralyzed.',
      shortEffect: 'Has a 30% chance of paralyzing attacking Pokémon on contact.',
    },
  })
  @ApiNotFoundResponse({
    description: 'Ability not found',
    example: {
      statusCode: 404,
      message: 'Ability "nonexistent" not found.',
      error: 'Not Found',
    },
  })
  async getAbilityDetail(@Param('name') name: string): Promise<AbilityDetailDto> {
    return await this.pokemonService.getAbilityDetail(name);
  }
}
