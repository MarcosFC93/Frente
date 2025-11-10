# 🎮 Pokemon Abilities API

Uma API RESTful moderna e otimizada para consultar habilidades de Pokémon, desenvolvida com NestJS, TypeScript e sistema de cache inteligente.

## ✨ Funcionalidades

- 🔍 **Consulta de Habilidades**: Busque todas as habilidades de qualquer Pokémon
- ⚡ **Cache Inteligente**: Sistema de cache com TTL configurável (padrão: 5 minutos)
- 📚 **Documentação Swagger**: Interface interativa para explorar a API
- 🏥 **Health Checks**: Monitoramento de saúde da aplicação e dependências
- 📊 **Logging Avançado**: Logs estruturados com métricas de performance
- 🛡️ **Tratamento de Erros**: Exception handling robusto
- ⚙️ **Configuração Flexível**: Variáveis de ambiente para diferentes ambientes
- 👨‍💼 **Painel Admin**: Endpoints para gerenciar cache e monitoramento

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clonar repositório
git clone <repository-url>
cd poke-api

# Instalar dependências
npm install

# Configurar ambiente (opcional)
cp .env.example .env

# Executar em modo desenvolvimento
npm run start:dev
```

### Acessos Rápidos
- **API**: http://localhost:3000
- **Documentação**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 📖 Endpoints Principais

### 🎯 Pokemon
```http
GET /pokemon/{name}
```
Retorna lista de habilidades do Pokémon especificado.

**Exemplo:**
```bash
curl http://localhost:3000/pokemon/pikachu
```
**Resposta:**
```json
["static", "lightning-rod"]
```

### 🏥 Health & Monitoring
```http
GET /health              # Health check completo
GET /health/liveness     # Liveness probe (K8s)
GET /health/readiness    # Readiness probe (K8s)
```

### 👨‍💼 Admin (Gerenciamento de Cache)
```http
GET /admin/pokemon/cache/stats        # Estatísticas do cache
DELETE /admin/pokemon/cache/{name}    # Limpar cache específico
POST /admin/pokemon/cache/warmup/{name} # Pré-aquecer cache
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Ambiente
NODE_ENV=development

# Servidor
PORT=3000

# PokeAPI
POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# Cache
CACHE_TTL=300          # TTL em segundos (5 min)
CACHE_MAX_ITEMS=100    # Máximo de itens no cache

# HTTP
HTTP_TIMEOUT=5000      # Timeout em ms (5 seg)
```

## 🧪 Testes

### Scripts Disponíveis
```bash
# Testes unitários
npm run test:unit

# Testes end-to-end
npm run test:e2e

# Todos os testes
npm run test:all

# Cobertura de código
npm run test:cov

# Testes em modo watch
npm run test:watch
```

### Cobertura Atual
- **Statements**: ~73%
- **Branches**: ~71%
- **Functions**: ~75%
- **Lines**: ~75%

## 🏗️ Arquitetura

### Stack Tecnológica
- **Framework**: NestJS 11.x
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Cache**: Cache Manager
- **HTTP Client**: Axios
- **Documentation**: Swagger/OpenAPI
- **Health Checks**: Terminus
- **Validation**: Class Validator
- **Testing**: Jest

### Estrutura do Projeto
```
src/
├── common/           # Utilitários compartilhados
│   ├── filters/      # Exception filters
│   └── interceptors/ # Interceptors globais
├── config/           # Configurações de ambiente
├── health/           # Health checks
├── pokemon/          # Módulo principal Pokemon
│   ├── dto/          # Data Transfer Objects
│   └── ...
└── test-utils/       # Utilitários para testes
```

## 🚀 Deployment

### Docker (Recomendado)
```dockerfile
# Dockerfile básico
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Build para Produção
```bash
# Build
npm run build

# Executar em produção
npm run start:prod
```

### Kubernetes
Health checks configurados para K8s:
- **Liveness**: `/health/liveness`
- **Readiness**: `/health/readiness`

## 📊 Monitoramento

### Métricas Incluídas
- ✅ Tempo de resposta de requests
- ✅ Status codes de resposta
- ✅ Cache hit/miss rates
- ✅ Uso de memória
- ✅ Conectividade com PokeAPI

### Logs Estruturados
```json
{
  "timestamp": "2025-11-09T12:00:00.000Z",
  "level": "info",
  "message": "📥 GET /pokemon/pikachu - IP: 127.0.0.1",
  "context": "LoggingInterceptor"
}
```

## 🔧 Development

### Scripts Úteis
```bash
# Desenvolvimento com reload
npm run start:dev

# Build
npm run build

# Linting
npm run lint

# Formatação
npm run format
```

### Extensões VS Code Recomendadas
- NestJS Files
- TypeScript Hero
- Thunder Client (para testes de API)
- Jest Runner

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

### Padrões de Código
- ✅ Seguir convenções do ESLint/Prettier
- ✅ Testes obrigatórios para novas features
- ✅ Documentação atualizada
- ✅ Tipos TypeScript rigorosos

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [PokeAPI](https://pokeapi.co/) - API de dados Pokémon
- [NestJS](https://nestjs.com/) - Framework Node.js
- Comunidade TypeScript

---

**Desenvolvido com ❤️ e ⚡ por [Seu Nome]**