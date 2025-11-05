import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private readonly httpService: HttpService) {}

  async getPokemonAbilities(name: string): Promise<string[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${name.toLowerCase()}`),
      );

      // Extrai somente as habilidades
      const abilities = data.abilities.map(
        (item: any) => item.ability.name,
      ).sort();

      return abilities;
    } catch (error) {
      throw new NotFoundException(`Pokémon "${name}" não encontrado.`);
    }
  }
}
