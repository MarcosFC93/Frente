import { IsEnum, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  POKEAPI_BASE_URL: string = 'https://pokeapi.co/api/v2';

  @IsNumber()
  @Min(60)
  @Max(3600)
  @IsOptional()
  CACHE_TTL: number = 300; // 5 minutos

  @IsNumber()
  @Min(10)
  @Max(1000)
  @IsOptional()
  CACHE_MAX_ITEMS: number = 100;

  @IsNumber()
  @Min(1000)
  @Max(30000)
  @IsOptional()
  HTTP_TIMEOUT: number = 5000; // 5 segundos
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);
  return validatedConfig;
};