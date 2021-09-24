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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthTokenWithSecretDto } from '../../../auth/auth-token-with-secret.dto';
import { AuthTokenDto } from '../../../auth/auth-token.dto';
import { AuthService } from '../../../auth/auth.service';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { User } from '../../../users/user.entity';
import { TimestampMillis } from '../../../utils/timestamp';
import { RequestUser } from '../../utils/request-user.decorator';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private authService: AuthService,
  ) {
    this.logger.setContext(TokensController.name);
  }

  @UseGuards(SessionGuard)
  @Get()
  async getUserTokens(@RequestUser() user: User): Promise<AuthTokenDto[]> {
    return (await this.authService.getTokensByUsername(user.userName)).map(
      (token) => this.authService.toAuthTokenDto(token),
    );
  }

  @UseGuards(SessionGuard)
  @Post()
  async postTokenRequest(
    @Body('label') label: string,
    @Body('validUntil') validUntil: TimestampMillis,
    @RequestUser() user: User,
  ): Promise<AuthTokenWithSecretDto> {
    return await this.authService.createTokenForUser(
      user.userName,
      label,
      validUntil,
    );
  }

  @UseGuards(SessionGuard)
  @Delete('/:keyId')
  @HttpCode(204)
  async deleteToken(
    @RequestUser() user: User,
    @Param('keyId') keyId: string,
  ): Promise<void> {
    const tokens = await this.authService.getTokensByUsername(user.userName);
    for (const token of tokens) {
      if (token.keyId == keyId) {
        return await this.authService.removeToken(keyId);
      }
    }
    throw new UnauthorizedException(
      'User is not authorized to delete this token',
    );
  }
}
