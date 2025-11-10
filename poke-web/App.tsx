import React, { useState } from 'react';
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

  const searchPokemon = async () => {
    if (!pokemonName.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o nome de um Pokémon');
      return;
    }

    setLoading(true);
    setError('');
    setPokemonData(null);

    try {
      const response = await axios.get(`${API_URL}/pokemon/${pokemonName.toLowerCase().trim()}`);
      setPokemonData({
        name: pokemonName.toLowerCase(),
        abilities: response.data,
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(`Pokémon "${pokemonName}" não encontrado`);
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
        <Text style={styles.subtitle}>Busque as habilidades do seu Pokémon favorito</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do Pokémon..."
          placeholderTextColor="#999"
          value={pokemonName}
          onChangeText={setPokemonName}
          onSubmitEditing={searchPokemon}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchPokemon}
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
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#0f3460',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
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
