/**
 * Test utilities and mock factories for Pokemon API tests
 */

export const createMockPokemonData = (name: string, abilities: string[]) => ({
  name,
  abilities: abilities.map(ability => ({ ability: { name: ability } })),
});

export const createMockAxiosResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: { headers: {} },
} as any);

export const mockHttpService = () => ({
  get: jest.fn(),
});

export const mockCacheManager = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

export const mockPokemonService = () => ({
  getPokemonAbilities: jest.fn(),
  clearCache: jest.fn(),
});

// Common test data
export const TEST_POKEMON_DATA = {
  pikachu: createMockPokemonData('pikachu', ['static', 'lightning-rod']),
  charizard: createMockPokemonData('charizard', ['blaze', 'solar-power']),
  ditto: createMockPokemonData('ditto', []),
  mrMime: createMockPokemonData('mr-mime', ['soundproof', 'filter', 'technician']),
};

export const EXPECTED_ABILITIES = {
  pikachu: ['static', 'lightning-rod'],
  charizard: ['blaze', 'solar-power'],
  ditto: [],
  mrMime: ['soundproof', 'filter', 'technician'],
};