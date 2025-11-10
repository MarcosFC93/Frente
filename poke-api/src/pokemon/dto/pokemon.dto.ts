import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPokemonAbilitiesDto {
  @ApiProperty({
    description: 'Nome do Pokémon',
    example: 'pikachu',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome não pode estar vazio' })
  @Length(1, 50, { message: 'Nome deve ter entre 1 e 50 caracteres' })
  @Matches(/^[a-zA-Z0-9\-\.]+$/, { 
    message: 'Nome deve conter apenas letras, números, hífens e pontos' 
  })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  name: string;
}

export class PokemonAbilitiesResponseDto {
  @ApiProperty({
    description: 'Lista de habilidades do Pokémon',
    example: ['static', 'lightning-rod'],
    type: [String],
  })
  abilities: string[];

  @ApiProperty({
    description: 'Sprite frontal padrão do Pokémon',
    example: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  })
  sprite: string;

  @ApiProperty({
    description: 'Indica se o resultado veio do cache',
    example: true,
  })
  fromCache?: boolean;
}