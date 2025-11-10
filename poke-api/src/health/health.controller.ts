import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check da aplicação' })
  @ApiResponse({ status: 200, description: 'Serviço saudável' })
  @ApiResponse({ status: 503, description: 'Serviço com problemas' })
  @HealthCheck()
  check() {
    return this.health.check([
      // Verifica se a PokeAPI está acessível
      () => this.http.pingCheck('pokeapi', 'https://pokeapi.co/api/v2/pokemon/1'),
      
      // Verifica uso de memória (alerta se > 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      
      // Verifica RSS memory (alerta se > 150MB)
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe para Kubernetes' })
  @ApiResponse({ status: 200, description: 'Aplicação está viva' })
  getLiveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe para Kubernetes' })
  @ApiResponse({ status: 200, description: 'Aplicação está pronta' })
  @HealthCheck()
  getReadiness() {
    return this.health.check([
      () => this.http.pingCheck('pokeapi', 'https://pokeapi.co/api/v2/pokemon/1'),
    ]);
  }
}