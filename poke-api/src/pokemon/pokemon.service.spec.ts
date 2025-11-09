import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpService: jest.Mocked<HttpService>;
  let cacheManager: jest.Mocked<any>;

  const mockPokemonData = {
    name: 'pikachu',
    abilities: [
      { ability: { name: 'static' } },
      { ability: { name: 'lightning-rod' } },
    ],
  };

  const createMockAxiosResponse = (data: any) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} },
  } as any);

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    httpService = module.get(HttpService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPokemonAbilities', () => {
    it('should return cached abilities when cache hit', async () => {
      // Arrange
      const pokemonName = 'pikachu';
      const cachedAbilities = ['static', 'lightning-rod'];
      cacheManager.get.mockResolvedValue(cachedAbilities);

      // Act
      const result = await service.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual(cachedAbilities);
      expect(cacheManager.get).toHaveBeenCalledWith('pokemon-abilities-pikachu');
      expect(httpService.get).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should fetch from API and cache result when cache miss', async () => {
      // Arrange
      const pokemonName = 'pikachu';
      const expectedAbilities = ['static', 'lightning-rod'];
      cacheManager.get.mockResolvedValue(null); // Cache miss
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockPokemonData)));

      // Act
      const result = await service.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual(expectedAbilities);
      expect(cacheManager.get).toHaveBeenCalledWith('pokemon-abilities-pikachu');
      expect(httpService.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
      expect(cacheManager.set).toHaveBeenCalledWith('pokemon-abilities-pikachu', expectedAbilities);
    });

    it('should handle uppercase pokemon names correctly', async () => {
      // Arrange
      const pokemonName = 'PIKACHU';
      const expectedAbilities = ['static', 'lightning-rod'];
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockPokemonData)));

      // Act
      const result = await service.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual(expectedAbilities);
      expect(cacheManager.get).toHaveBeenCalledWith('pokemon-abilities-pikachu');
      expect(httpService.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
    });

    it('should throw NotFoundException when pokemon is not found', async () => {
      // Arrange
      const pokemonName = 'nonexistent';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(throwError(() => new Error('Pokemon not found')));

      // Act & Assert
      await expect(service.getPokemonAbilities(pokemonName)).rejects.toThrow(
        new NotFoundException('Pokémon "nonexistent" não encontrado.')
      );
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should handle empty abilities array', async () => {
      // Arrange
      const pokemonName = 'ditto';
      const mockDataWithoutAbilities = { ...mockPokemonData, abilities: [] };
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockDataWithoutAbilities)));

      // Act
      const result = await service.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual([]);
      expect(cacheManager.set).toHaveBeenCalledWith('pokemon-abilities-ditto', []);
    });
  });

  describe('clearCache', () => {
    it('should clear specific pokemon from cache when name provided', async () => {
      // Arrange
      const pokemonName = 'pikachu';

      // Act
      await service.clearCache(pokemonName);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith('pokemon-abilities-pikachu');
    });

    it('should handle uppercase pokemon names in cache clearing', async () => {
      // Arrange
      const pokemonName = 'PIKACHU';

      // Act
      await service.clearCache(pokemonName);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith('pokemon-abilities-pikachu');
    });

    it('should log message when clearing all cache (no name provided)', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.clearCache();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Para limpar todo o cache, reinicie a aplicação');
      expect(cacheManager.del).not.toHaveBeenCalled();
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});
