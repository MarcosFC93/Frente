import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';

// Configure o URL da sua API aqui
const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://localhost:3000';

interface PokemonData {
  name: string;
  abilities: string[];
  sprite: string;
}

interface AbilityDetail {
  name: string;
  effect: string;
  shortEffect?: string;
}

// Componente otimizado para item de habilidade
const AbilityItem = React.memo(({ item, effect }: { item: string; effect?: string }) => (
  <View style={styles.abilityItem}>
    <View style={styles.abilityHeader}>
      <Text style={styles.abilityText}>⚡ {item}</Text>
    </View>
    {effect && (
      <View style={styles.abilityDescription}>
        <Text style={styles.abilityDescriptionText}>{effect}</Text>
      </View>
    )}
  </View>
));

// Componente otimizado para item de sugestão
const SuggestionItem = React.memo(({ 
  pokemon, 
  onPress 
}: { 
  pokemon: string; 
  onPress: (pokemon: string) => void;
}) => (
  <TouchableOpacity
    style={styles.suggestionItem}
    onPress={() => onPress(pokemon)}
  >
    <Text style={styles.suggestionText}>{pokemon}</Text>
  </TouchableOpacity>
));

export default function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [abilityDetails, setAbilityDetails] = useState<Record<string, AbilityDetail>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pokemonList, setPokemonList] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingAbilities, setLoadingAbilities] = useState(false);
  
  // Refs para controle
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Carrega a lista de pokémons ao iniciar o app
  useEffect(() => {
    loadPokemonList();
    
    // Cleanup: cancela requisições pendentes ao desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadPokemonList = async () => {
    try {
      setLoadingList(true);
      const response = await axios.get(`${API_URL}/pokemon`, {
        signal: abortControllerRef.current?.signal
      });
      setPokemonList(response.data);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request cancelled');
        return;
      }
      console.error('Erro ao carregar lista de Pokémon:', err);
      // Fallback para lista básica se a API falhar
      setPokemonList([
        'bulbasaur', 'charmander', 'squirtle', 'pikachu', 'charizard',
        'mewtwo', 'mew', 'ditto', 'eevee', 'snorlax'
      ]);
    } finally {
      setLoadingList(false);
    }
  };

  // Memoiza a lista filtrada para evitar recalcular a cada render
  const filteredPokemon = useMemo(() => {
    if (pokemonList.length === 0) return [];
    
    if (pokemonName.trim().length > 0) {
      return pokemonList
        .filter(pokemon => pokemon.toLowerCase().includes(pokemonName.toLowerCase()))
        .slice(0, 20);
    }
    return pokemonList.slice(0, 20);
  }, [pokemonName, pokemonList]);

  // useCallback para evitar recriar funções a cada render
  const handleInputChange = useCallback((text: string) => {
    setPokemonName(text);
    
    // Debounce para filtros (opcional, melhora em listas muito grandes)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    setShowSuggestions(text.length > 0 || pokemonList.length > 0);
  }, [pokemonList.length]);

  const handleInputFocus = useCallback(() => {
    if (pokemonList.length > 0) {
      setShowSuggestions(true);
    }
  }, [pokemonList.length]);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  const selectPokemon = useCallback((pokemon: string) => {
    setPokemonName(pokemon);
    setShowSuggestions(false);
    searchPokemon(pokemon);
  }, []);

  // Buscar detalhes das habilidades
  const fetchAbilityDetails = useCallback(async (abilities: string[]) => {
    console.log('🔍 Buscando detalhes para habilidades:', abilities);
    setLoadingAbilities(true);
    const details: Record<string, AbilityDetail> = {};
    
    try {
      await Promise.all(
        abilities.map(async (ability) => {
          try {
            console.log(`📡 Fazendo requisição para: ${API_URL}/pokemon/ability/${ability}`);
            const response = await axios.get(`${API_URL}/pokemon/ability/${ability}`);
            console.log(`✅ Resposta recebida para ${ability}:`, response.data);
            details[ability] = response.data;
          } catch (err) {
            console.log(`❌ Erro ao buscar detalhes da habilidade ${ability}:`, err);
          }
        })
      );
      console.log('📦 Todos os detalhes coletados:', details);
      setAbilityDetails(details);
    } catch (err) {
      console.log('❌ Erro ao buscar detalhes das habilidades:', err);
    } finally {
      setLoadingAbilities(false);
    }
  }, []);

  const searchPokemon = useCallback(async (customName?: string) => {
    const searchName = customName || pokemonName;
    
    if (!searchName.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o nome de um Pokémon');
      return;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Cria novo AbortController para esta requisição
    abortControllerRef.current = new AbortController();

    setShowSuggestions(false);
    setLoading(true);
    setError('');
    setPokemonData(null);

    try {
      const response = await axios.get(
        `${API_URL}/pokemon/${searchName.toLowerCase().trim()}`,
        { signal: abortControllerRef.current.signal }
      );
      
      setPokemonData({
        name: searchName.toLowerCase(),
        abilities: response.data.abilities || response.data,
        sprite: response.data.sprite || '',
      });
      
      // Buscar detalhes das habilidades
      const abilities = response.data.abilities || response.data;
      if (abilities && abilities.length > 0) {
        await fetchAbilityDetails(abilities);
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log('Search cancelled');
        return;
      }
      
      if (err.response?.status === 404) {
        setError(`Pokémon "${searchName}" não encontrado`);
      } else {
        setError('Erro ao buscar Pokémon. Verifique sua conexão.');
      }
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [pokemonName, fetchAbilityDetails]);

  const renderSuggestionItem = useCallback(({ item }: { item: string }) => (
    <SuggestionItem pokemon={item} onPress={selectPokemon} />
  ), [selectPokemon]);

  const renderAbilityItem = useCallback(({ item }: { item: string }) => (
    <AbilityItem item={item} effect={abilityDetails[item]?.effect} />
  ), [abilityDetails]);

  const keyExtractor = useCallback((item: string, index: number) => `${item}-${index}`, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Pokémon Abilities</Text>
        <Text style={styles.subtitle}>
          {loadingList 
            ? 'Carregando lista de Pokémons...' 
            : `Busque entre ${pokemonList.length} Pokémons disponíveis`
          }
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputWithIcon}>
            <TextInput
              style={styles.input}
              placeholder="Selecione ou digite o nome do Pokémon..."
              placeholderTextColor="#999"
              value={pokemonName}
              onChangeText={handleInputChange}
              onSubmitEditing={() => searchPokemon()}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.dropdownIcon}
              onPress={handleInputFocus}
            >
              <Text style={styles.dropdownIconText}>
                {showSuggestions ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          </View>
          {showSuggestions && filteredPokemon.length > 0 && (
            <FlatList
              data={filteredPokemon}
              renderItem={renderSuggestionItem}
              keyExtractor={keyExtractor}
              style={styles.suggestionsContainer}
              windowSize={5}
              removeClippedSubviews={true}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              ListFooterComponent={
                pokemonName.trim().length === 0 && pokemonList.length > 20 ? (
                  <View style={styles.suggestionFooter}>
                    <Text style={styles.suggestionFooterText}>
                      Digite para filtrar entre {pokemonList.length} pokémons...
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => searchPokemon()}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? '...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Buscando...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {pokemonData && !loading && (
          <View style={styles.pokemonCard}>
            <View style={styles.pokemonHeader}>
              {pokemonData.sprite && (
                <Image 
                  source={{ uri: pokemonData.sprite }}
                  style={styles.pokemonSprite}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.pokemonName}>
                {pokemonData.name.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.abilitiesTitle}>Habilidades:</Text>
            <FlatList
              data={pokemonData.abilities}
              renderItem={renderAbilityItem}
              keyExtractor={keyExtractor}
              style={styles.abilitiesList}
              removeClippedSubviews={true}
            />
          </View>
        )}

        {!pokemonData && !loading && !error && (
          <View style={styles.centerContent}>
            <Text style={styles.emptyStateIcon}>🎮</Text>
            <Text style={styles.emptyStateText}>
              Digite o nome de um Pokémon para começar
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    zIndex: 1000,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  inputWithIcon: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#0f3460',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingRight: 50,
    color: '#fff',
    fontSize: 16,
    zIndex: 1,
  },
  dropdownIcon: {
    position: 'absolute',
    right: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 2,
  },
  dropdownIconText: {
    color: '#999',
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 250,
    backgroundColor: '#0f3460',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  suggestionFooter: {
    padding: 15,
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  suggestionFooterText: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  pokemonCard: {
    backgroundColor: '#0f3460',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pokemonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 15,
  },
  pokemonSprite: {
    width: 80,
    height: 80,
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  abilitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  abilitiesList: {
    maxHeight: 300,
  },
  abilityItem: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  abilityHeader: {
    marginBottom: 4,
  },
  abilityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  abilityDescription: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
  },
  abilityDescriptionText: {
    color: '#AAA',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});
