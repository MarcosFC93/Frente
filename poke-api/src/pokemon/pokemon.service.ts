import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPokemonAbilities(name: string): Promise<string[]> {
    const cacheKey = `pokemon-abilities-${name.toLowerCase()}`;
    
    // Verifica se já existe no cache
    const cachedAbilities = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedAbilities) {
      return cachedAbilities;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${name.toLowerCase()}`),
      );

      // Extrai somente as habilidades
      const abilities = data.abilities.map(
        (item: any) => item.ability.name,
      );

      // Armazena no cache por 5 minutos (TTL configurado no módulo)
      await this.cacheManager.set(cacheKey, abilities);

      return abilities;
    } catch (error) {
      throw new NotFoundException(`Pokémon "${name}" não encontrado.`);
    }
  }

  async clearCache(name?: string): Promise<void> {
    if (name) {
      // Remove um Pokémon específico do cache
      const cacheKey = `pokemon-abilities-${name.toLowerCase()}`;
      await this.cacheManager.del(cacheKey);
    } else {
      // Para limpar todo o cache, precisaríamos implementar uma lógica adicional
      // Por enquanto, vamos focar apenas na limpeza por nome específico
      console.log('Para limpar todo o cache, reinicie a aplicação');
    }
  }
}
