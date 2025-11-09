import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

describe('PokemonController', () => {
  let controller: PokemonController;
  let pokemonService: jest.Mocked<PokemonService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockPokemonService = {
      getPokemonAbilities: jest.fn(),
      clearCache: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
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

    controller = module.get<PokemonController>(PokemonController);
    pokemonService = module.get(PokemonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPokemonAbilities', () => {
    it('should return pokemon abilities for valid pokemon name', async () => {
      // Arrange
      const pokemonName = 'pikachu';
      const expectedAbilities = ['static', 'lightning-rod'];
      pokemonService.getPokemonAbilities.mockResolvedValue(expectedAbilities);

      // Act
      const result = await controller.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual(expectedAbilities);
      expect(pokemonService.getPokemonAbilities).toHaveBeenCalledWith(pokemonName);
      expect(pokemonService.getPokemonAbilities).toHaveBeenCalledTimes(1);
    });

    it('should handle uppercase pokemon names', async () => {
      // Arrange
      const pokemonName = 'CHARIZARD';
      const expectedAbilities = ['blaze', 'solar-power'];
      pokemonService.getPokemonAbilities.mockResolvedValue(expectedAbilities);

      // Act
      const result = await controller.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual(expectedAbilities);
      expect(pokemonService.getPokemonAbilities).toHaveBeenCalledWith(pokemonName);
    });

    it('should handle pokemon names with special characters', async () => {
      // Arrange
      const pokemonName = 'mr-mime';
      const expectedAbilities = ['soundproof', 'filter', 'technician'];
      pokemonService.getPokemonAbilities.mockResolvedValue(expectedAbilities);

      // Act
      const result = await controller.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual(expectedAbilities);
      expect(pokemonService.getPokemonAbilities).toHaveBeenCalledWith(pokemonName);
    });

    it('should return empty array for pokemon with no abilities', async () => {
      // Arrange
      const pokemonName = 'ditto';
      const expectedAbilities: string[] = [];
      pokemonService.getPokemonAbilities.mockResolvedValue(expectedAbilities);

      // Act
      const result = await controller.getPokemonAbilities(pokemonName);

      // Assert
      expect(result).toEqual([]);
      expect(pokemonService.getPokemonAbilities).toHaveBeenCalledWith(pokemonName);
    });

    it('should throw NotFoundException when pokemon is not found', async () => {
      // Arrange
      const pokemonName = 'nonexistent';
      const errorMessage = 'Pokémon "nonexistent" não encontrado.';
      pokemonService.getPokemonAbilities.mockRejectedValue(new NotFoundException(errorMessage));

      // Act & Assert
      await expect(controller.getPokemonAbilities(pokemonName)).rejects.toThrow(NotFoundException);
      await expect(controller.getPokemonAbilities(pokemonName)).rejects.toThrow(errorMessage);
      expect(pokemonService.getPokemonAbilities).toHaveBeenCalledWith(pokemonName);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const pokemonName = 'pikachu';
      const serviceError = new Error('Service temporarily unavailable');
      pokemonService.getPokemonAbilities.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.getPokemonAbilities(pokemonName)).rejects.toThrow(serviceError);
      expect(pokemonService.getPokemonAbilities).toHaveBeenCalledWith(pokemonName);
    });
  });
});
