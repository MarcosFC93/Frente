import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import axios from 'axios';

// Configure o URL da sua API aqui
// Para web use localhost, para dispositivo físico use o IP da máquina
const API_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://localhost:3000';

interface PokemonData {
  name: string;
  abilities: string[];
}

export default function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPokemon, setFilteredPokemon] = useState<string[]>([]);
  const [pokemonList, setPokemonList] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Carrega a lista de pokémons ao iniciar o app
  useEffect(() => {
    loadPokemonList();
  }, []);

  const loadPokemonList = async () => {
    try {
      setLoadingList(true);
      const response = await axios.get(`${API_URL}/pokemon`);
      setPokemonList(response.data);
    } catch (err) {
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

  const handleInputChange = (text: string) => {
    setPokemonName(text);
    
    if (pokemonList.length > 0) {
      if (text.trim().length > 0) {
        // Filtra pokémons que contêm o texto digitado
        const filtered = pokemonList.filter(pokemon =>
          pokemon.toLowerCase().includes(text.toLowerCase())
        ).slice(0, 15); // Limita a 15 sugestões quando está filtrando
        setFilteredPokemon(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        // Se não há texto, mostra os primeiros 15 pokémons
        setFilteredPokemon(pokemonList.slice(0, 15));
      }
    }
  };

  const handleInputFocus = () => {
    if (pokemonList.length > 0) {
      if (pokemonName.trim().length > 0) {
        // Se há texto, filtra
        const filtered = pokemonList.filter(pokemon =>
          pokemon.toLowerCase().includes(pokemonName.toLowerCase())
        ).slice(0, 15);
        setFilteredPokemon(filtered);
      } else {
        // Se não há texto, mostra os primeiros 15
        setFilteredPokemon(pokemonList.slice(0, 15));
      }
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir que o clique no item funcione
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const selectPokemon = (pokemon: string) => {
    setPokemonName(pokemon);
    setShowSuggestions(false);
    searchPokemon(pokemon);
  };

  const searchPokemon = async (customName?: string) => {
    const searchName = customName || pokemonName;
    
    if (!searchName.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o nome de um Pokémon');
      return;
    }

    setShowSuggestions(false);
    setLoading(true);
    setError('');
    setPokemonData(null);

    try {
      const response = await axios.get(`${API_URL}/pokemon/${searchName.toLowerCase().trim()}`);
      setPokemonData({
        name: searchName.toLowerCase(),
        abilities: response.data,
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(`Pokémon "${searchName}" não encontrado`);
      } else {
        setError('Erro ao buscar Pokémon. Verifique sua conexão.');
      }
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderAbilityItem = ({ item }: { item: string }) => (
    <View style={styles.abilityItem}>
      <Text style={styles.abilityText}>⚡ {item}</Text>
    </View>
  );

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
            <ScrollView style={styles.suggestionsContainer} nestedScrollEnabled>
              {filteredPokemon.map((pokemon, index) => (
                <TouchableOpacity
                  key={`${pokemon}-${index}`}
                  style={styles.suggestionItem}
                  onPress={() => selectPokemon(pokemon)}
                >
                  <Text style={styles.suggestionText}>{pokemon}</Text>
                </TouchableOpacity>
              ))}
              {pokemonName.trim().length === 0 && pokemonList.length > 15 && (
                <View style={styles.suggestionFooter}>
                  <Text style={styles.suggestionFooterText}>
                    Digite para filtrar entre {pokemonList.length} pokémons...
                  </Text>
                </View>
              )}
            </ScrollView>
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
            <Text style={styles.pokemonName}>
              {pokemonData.name.toUpperCase()}
            </Text>
            <Text style={styles.abilitiesTitle}>Habilidades:</Text>
            <FlatList
              data={pokemonData.abilities}
              renderItem={renderAbilityItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              style={styles.abilitiesList}
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
    maxHeight: 200,
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
  pokemonName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  abilityText: {
    color: '#fff',
    fontSize: 16,
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
