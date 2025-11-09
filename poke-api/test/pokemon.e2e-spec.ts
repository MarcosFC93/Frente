import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('Pokemon (e2e)', () => {
  let app: INestApplication<App>;
  let httpService: jest.Mocked<HttpService>;

  const mockPikachuData = {
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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .compile();

    app = moduleFixture.createNestApplication();
    httpService = moduleFixture.get(HttpService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/pokemon/:name (GET)', () => {
    it('should return pokemon abilities for valid pokemon name', async () => {
      // Arrange
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockPikachuData)));

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/pokemon/pikachu')
        .expect(200);

      expect(response.body).toEqual(['static', 'lightning-rod']);
      expect(httpService.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
    });

    it('should handle uppercase pokemon names', async () => {
      // Arrange
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockPikachuData)));

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/pokemon/PIKACHU')
        .expect(200);

      expect(response.body).toEqual(['static', 'lightning-rod']);
      expect(httpService.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
    });

    it('should return 404 for non-existent pokemon', async () => {
      // Arrange
      httpService.get.mockReturnValue(throwError(() => new Error('Pokemon not found')));

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/pokemon/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('Pokémon "nonexistent" não encontrado.');
    });

    it('should handle pokemon with no abilities', async () => {
      // Arrange
      const mockDittoData = { ...mockPikachuData, name: 'ditto', abilities: [] };
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockDittoData)));

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/pokemon/ditto')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should use cache on second request (cache hit)', async () => {
      // Arrange
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockPikachuData)));

      // Act - First request
      await request(app.getHttpServer())
        .get('/pokemon/pikachu')
        .expect(200);

      // Clear mock to verify cache is used
      httpService.get.mockClear();

      // Act - Second request (should use cache)
      const response = await request(app.getHttpServer())
        .get('/pokemon/pikachu')
        .expect(200);

      // Assert
      expect(response.body).toEqual(['static', 'lightning-rod']);
      expect(httpService.get).not.toHaveBeenCalled(); // Should not call API again
    });

    it('should handle pokemon names with special characters', async () => {
      // Arrange
      const mockMrMimeData = {
        name: 'mr-mime',
        abilities: [
          { ability: { name: 'soundproof' } },
          { ability: { name: 'filter' } },
          { ability: { name: 'technician' } },
        ],
      };
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockMrMimeData)));

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/pokemon/mr-mime')
        .expect(200);

      expect(response.body).toEqual(['soundproof', 'filter', 'technician']);
    });

    it('should return proper content-type header', async () => {
      // Arrange
      httpService.get.mockReturnValue(of(createMockAxiosResponse(mockPikachuData)));

      // Act & Assert
      await request(app.getHttpServer())
        .get('/pokemon/pikachu')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });
});