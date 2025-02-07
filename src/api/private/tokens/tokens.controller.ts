/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthTokenWithSecretDto } from '../../../auth/auth-token-with-secret.dto';
import { AuthTokenDto } from '../../../auth/auth-token.dto';
import { AuthService } from '../../../auth/auth.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { TimestampMillis } from '../../../utils/timestamp';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private authService: AuthService,
  ) {
    this.logger.setContext(TokensController.name);
  }

  @Get()
  async getUserTokens(): Promise<AuthTokenDto[]> {
    // ToDo: Get real userName
    return (await this.authService.getTokensByUsername('hardcoded')).map(
      (token) => this.authService.toAuthTokenDto(token),
    );
  }

  @Post()
  async postTokenRequest(
    @Body('label') label: string,
    @Body('validUntil') validUntil: TimestampMillis,
  ): Promise<AuthTokenWithSecretDto> {
    // ToDo: Get real userName
    return await this.authService.createTokenForUser(
      'hardcoded',
      label,
      validUntil,
    );
  }

  @Delete('/:keyId')
  @HttpCode(204)
  async deleteToken(@Param('keyId') keyId: string): Promise<void> {
    return await this.authService.removeToken(keyId);
  }
}
