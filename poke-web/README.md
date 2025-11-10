# 🎮 Poke-Web - Frontend para Pokémon Abilities API

Frontend React Native (Expo) para consumir a API de habilidades de Pokémon.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Backend `poke-api` rodando em `http://localhost:3000`

## 🚀 Como executar

### 1. Instalar dependências

```bash
cd poke-web
npm install
```

### 2. Iniciar o backend

Certifique-se de que o backend está rodando:

```bash
cd ../poke-api
npm run start:dev
```

### 3. Iniciar o frontend

```bash
npm start
```

Isso abrirá o Expo DevTools no navegador. Você pode então:
- Pressionar `w` para abrir no navegador web
- Escanear o QR code com o app Expo Go no celular
- Pressionar `a` para Android Emulator
- Pressionar `i` para iOS Simulator (apenas macOS)

## 🎨 Funcionalidades

- ✅ Busca de Pokémon por nome
- ✅ Exibição de todas as habilidades
- ✅ Interface responsiva e moderna
- ✅ Tratamento de erros
- ✅ Loading states
- ✅ Dark theme

## ⚙️ Configuração

Se o backend estiver rodando em outra porta ou URL, edite a constante `API_URL` no arquivo `App.tsx`:

```typescript
const API_URL = 'http://localhost:3000';
```

### Para testar no dispositivo físico:

1. Descubra o IP local da sua máquina:
   - Windows: `ipconfig` (procure por IPv4)
   - Mac/Linux: `ifconfig` ou `ip addr`

2. Altere a `API_URL`:
   ```typescript
   const API_URL = 'http://SEU_IP_LOCAL:3000';
   ```

3. Certifique-se de que o backend está acessível na rede local

## 📱 Testando

Pokémons para testar:
- pikachu
- charizard
- bulbasaur
- squirtle
- mewtwo
- ditto

## 🎯 Arquitetura

```
App.tsx          → Componente principal com toda a lógica
├── Estado       → Gerenciamento com useState
├── API          → Chamadas com axios
└── UI           → Interface responsiva com React Native
```

## 🔧 Tecnologias

- **React Native** (via Expo)
- **TypeScript**
- **Axios** - requisições HTTP
- **Expo** - toolchain e desenvolvimento
