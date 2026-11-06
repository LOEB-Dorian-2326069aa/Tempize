import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatutParticipation } from '../../../common/enums';

export class UpdateParticipationDto {
  @ApiProperty({
    enum: [StatutParticipation.ACCEPTE, StatutParticipation.REFUSE],
    example: StatutParticipation.ACCEPTE,
    description: 'Nouveau statut de la demande : accepte ou refuse',
  })
  @IsEnum(StatutParticipation)
  @IsNotEmpty()
  statut: StatutParticipation;
}
