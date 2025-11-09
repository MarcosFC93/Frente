import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of } from 'rxjs';
import { createMockAxiosResponse, TEST_POKEMON_DATA } from '../test-utils/mock-factories';

describe('Pokemon Cache Performance', () => {
  let service: PokemonService;
  let httpService: jest.Mocked<HttpService>;
  let cacheManager: jest.Mocked<any>;

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

  describe('Cache Performance Tests', () => {
    it('should only call API once for multiple requests of same pokemon', async () => {
      // Arrange
      const pokemonName = 'pikachu';
      const expectedAbilities = ['static', 'lightning-rod'];
      
      // First call returns null (cache miss), subsequent calls return cached data
      cacheManager.get
        .mockResolvedValueOnce(null) // First call - cache miss
        .mockResolvedValue(expectedAbilities); // Subsequent calls - cache hit
      
      httpService.get.mockReturnValue(of(createMockAxiosResponse(TEST_POKEMON_DATA.pikachu)));

      // Act - Make multiple requests
      const promises = Array(5).fill(null).map(() => 
        service.getPokemonAbilities(pokemonName)
      );
      
      const results = await Promise.all(promises);

      // Assert
      results.forEach(result => {
        expect(result).toEqual(expectedAbilities);
      });
      
      // API should only be called once
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
      
      // Cache should be set once
      expect(cacheManager.set).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).toHaveBeenCalledWith('pokemon-abilities-pikachu', expectedAbilities);
    });

    it('should handle concurrent requests efficiently', async () => {
      // Arrange
      const pokemonNames = ['pikachu', 'charizard', 'ditto'];
      const startTime = Date.now();
      
      // Mock cache misses for all
      cacheManager.get.mockResolvedValue(null);
      
      // Mock API responses
      httpService.get
        .mockReturnValueOnce(of(createMockAxiosResponse(TEST_POKEMON_DATA.pikachu)))
        .mockReturnValueOnce(of(createMockAxiosResponse(TEST_POKEMON_DATA.charizard)))
        .mockReturnValueOnce(of(createMockAxiosResponse(TEST_POKEMON_DATA.ditto)));

      // Act - Make concurrent requests
      const promises = pokemonNames.map(name => service.getPokemonAbilities(name));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(results).toHaveLength(3);
      expect(httpService.get).toHaveBeenCalledTimes(3);
      expect(cacheManager.set).toHaveBeenCalledTimes(3);
      
      // Performance assertion - should complete reasonably fast
      expect(duration).toBeLessThan(1000); // Less than 1 second
    });

    it('should demonstrate cache efficiency over multiple calls', async () => {
      // Arrange
      const pokemonName = 'pikachu';
      const expectedAbilities = ['static', 'lightning-rod'];
      const numberOfCalls = 10;
      
      // Setup: First call cache miss, rest cache hits
      cacheManager.get
        .mockResolvedValueOnce(null)
        .mockResolvedValue(expectedAbilities);
      
      httpService.get.mockReturnValue(of(createMockAxiosResponse(TEST_POKEMON_DATA.pikachu)));

      // Act - Make first call (cache miss)
      await service.getPokemonAbilities(pokemonName);
      
      // Clear API mock call count
      httpService.get.mockClear();
      
      // Make additional calls (should all be cache hits)
      const promises = Array(numberOfCalls - 1).fill(null).map(() => 
        service.getPokemonAbilities(pokemonName)
      );
      
      const results = await Promise.all(promises);

      // Assert
      results.forEach(result => {
        expect(result).toEqual(expectedAbilities);
      });
      
      // API should not be called again after first request
      expect(httpService.get).not.toHaveBeenCalled();
      
      // Cache get should be called for each request
      expect(cacheManager.get).toHaveBeenCalledTimes(numberOfCalls);
    });

    it('should handle cache clearing correctly', async () => {
      // Arrange
      const pokemonName = 'pikachu';
      const expectedAbilities = ['static', 'lightning-rod'];
      
      // Setup cache hit
      cacheManager.get.mockResolvedValue(expectedAbilities);
      
      // Act - Get abilities (should use cache)
      const result1 = await service.getPokemonAbilities(pokemonName);
      
      // Clear cache
      await service.clearCache(pokemonName);
      
      // Setup cache miss after clearing
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of(createMockAxiosResponse(TEST_POKEMON_DATA.pikachu)));
      
      // Get abilities again (should call API)
      const result2 = await service.getPokemonAbilities(pokemonName);

      // Assert
      expect(result1).toEqual(expectedAbilities);
      expect(result2).toEqual(expectedAbilities);
      
      expect(cacheManager.del).toHaveBeenCalledWith('pokemon-abilities-pikachu');
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });
  });
});