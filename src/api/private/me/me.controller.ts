/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Body, Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';

import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { UserInfoDto } from '../../../users/user-info.dto';
import { UsersService } from '../../../users/users.service';

@Controller('me')
export class MeController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private userService: UsersService,
    private mediaService: MediaService,
  ) {
    this.logger.setContext(MeController.name);
  }

  @Get()
  async getMe(): Promise<UserInfoDto> {
    // ToDo: use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    return this.userService.toUserDto(user);
  }

  @Get('media')
  async getMyMedia(): Promise<MediaUploadDto[]> {
    // ToDo: use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    const media = await this.mediaService.listUploadsByUser(user);
    return media.map((media) => this.mediaService.toMediaUploadDto(media));
  }

  @Delete()
  @HttpCode(204)
  async deleteUser(): Promise<void> {
    // ToDo: use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    const mediaUploads = await this.mediaService.listUploadsByUser(user);
    for (const mediaUpload of mediaUploads) {
      await this.mediaService.deleteFile(mediaUpload);
    }
    this.logger.debug(`Deleted all media uploads of ${user.userName}`);
    await this.userService.deleteUser(user);
    this.logger.debug(`Deleted ${user.userName}`);
  }

  @Post('profile')
  @HttpCode(200)
  async updateDisplayName(@Body('name') newDisplayName: string): Promise<void> {
    // ToDo: use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    await this.userService.changeDisplayName(user, newDisplayName);
  }
}
