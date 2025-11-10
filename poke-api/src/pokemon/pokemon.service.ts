import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

interface PokemonApiResponse {
  id: number;
  name: string;
  abilities: PokemonAbility[];
}

interface PokemonListApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  private readonly baseUrl: string;
  private readonly httpTimeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2');
    this.httpTimeout = this.configService.get<number>('HTTP_TIMEOUT', 5000);
  }

  async getPokemonAbilities(name: string): Promise<string[]> {
    const normalizedName = this.normalizePokemonName(name);
    const cacheKey = `pokemon-abilities-${normalizedName}`;
    
    // Verifica se já existe no cache
    const cachedAbilities = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedAbilities) {
      this.logger.debug(`Cache hit for Pokemon: ${normalizedName}`);
      return cachedAbilities;
    }

    this.logger.debug(`Cache miss for Pokemon: ${normalizedName}, fetching from API`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<PokemonApiResponse>(`${this.baseUrl}/pokemon/${normalizedName}`)
          .pipe(
            timeout(this.httpTimeout),
            catchError((error) => {
              this.logger.error(`Error fetching Pokemon ${normalizedName}:`, error.message);
              throw error;
            })
          )
      );

      // Extrai e ordena as habilidades
      const abilities = data.abilities
        .map((item: PokemonAbility) => item.ability.name)
        .sort();

      // Armazena no cache
      await this.cacheManager.set(cacheKey, abilities);
      this.logger.debug(`Cached abilities for Pokemon: ${normalizedName}`);

      return abilities;
    } catch (error) {
      this.logger.error(`Failed to fetch Pokemon ${normalizedName}:`, error.message);
      
      if (error.response?.status === 404) {
        throw new NotFoundException(`Pokémon "${name}" não encontrado.`);
      }
      
      throw new NotFoundException(`Erro ao buscar Pokémon "${name}". Tente novamente.`);
    }
  }

  async getAllPokemon(): Promise<string[]> {
    const cacheKey = 'pokemon-list-all';
    
    // Verifica se já existe no cache
    const cachedList = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedList) {
      this.logger.debug('Cache hit for Pokemon list');
      return cachedList;
    }

    this.logger.debug('Cache miss for Pokemon list, fetching from API');

    try {
      // Primeiro, busca quantos pokémons existem no total
      const { data: initialData } = await firstValueFrom(
        this.httpService.get<PokemonListApiResponse>(`${this.baseUrl}/pokemon?limit=1`)
          .pipe(
            timeout(this.httpTimeout),
            catchError((error) => {
              this.logger.error('Error fetching Pokemon count:', error.message);
              throw error;
            })
          )
      );

      const totalCount = initialData.count;
      this.logger.debug(`Total Pokemon count: ${totalCount}`);

      // Agora busca todos os pokémons usando o count total
      const { data } = await firstValueFrom(
        this.httpService.get<PokemonListApiResponse>(`${this.baseUrl}/pokemon?limit=${totalCount}`)
          .pipe(
            timeout(this.httpTimeout * 3), // Timeout maior para lista completa
            catchError((error) => {
              this.logger.error('Error fetching Pokemon list:', error.message);
              throw error;
            })
          )
      );

      // Extrai apenas os nomes
      const pokemonNames = data.results.map(pokemon => pokemon.name).sort();

      // Armazena no cache por um tempo maior (ex: 24 horas)
      await this.cacheManager.set(cacheKey, pokemonNames, 86400000); // 24 horas em ms
      this.logger.log(`Cached ${pokemonNames.length} Pokemon names`);

      return pokemonNames;
    } catch (error) {
      this.logger.error('Failed to fetch Pokemon list:', error.message);
      throw new NotFoundException('Erro ao buscar lista de Pokémon. Tente novamente.');
    }
  }

  async clearCache(name?: string): Promise<{ cleared: boolean; target: string }> {
    if (name) {
      const normalizedName = this.normalizePokemonName(name);
      const cacheKey = `pokemon-abilities-${normalizedName}`;
      await this.cacheManager.del(cacheKey);
      this.logger.log(`Cache cleared for Pokemon: ${normalizedName}`);
      return { cleared: true, target: normalizedName };
    } else {
      // Para implementar limpeza total, seria necessário armazenar chaves
      this.logger.warn('Full cache clear not implemented. Restart application to clear all cache.');
      return { cleared: false, target: 'all (not implemented)' };
    }
  }

  async getCacheStats(): Promise<{ size: number; maxSize: number; ttl: number }> {
    // Esta implementação depende do cache manager específico
    // Por agora, retorna configurações básicas
    const ttl = this.configService.get<number>('CACHE_TTL', 300);
    const maxSize = this.configService.get<number>('CACHE_MAX_ITEMS', 100);
    
    return {
      size: 0, // Não disponível com o cache padrão
      maxSize,
      ttl,
    };
  }

  private normalizePokemonName(name: string): string {
    return name.toLowerCase().trim().replace(/[^a-z0-9\-]/g, '');
  }
}
