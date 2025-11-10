import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PokemonController } from './pokemon.controller';
import { PokemonAdminController } from './pokemon-admin.controller';
import { PokemonService } from './pokemon.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT', 5000),
        maxRedirects: 3,
        retries: 2,
      }),
    }),
  ],
  controllers: [PokemonController, PokemonAdminController],
  providers: [PokemonService],
  exports: [PokemonService],
})
export class PokemonModule {}
