import { Controller, Get, Param } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get(':name')
  async getPokemonAbilities(@Param('name') name: string) {
    const abilities = await this.pokemonService.getPokemonAbilities(name);
    return abilities;
  }
}
