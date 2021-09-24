/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ClientError,
  MediaBackendError,
  NotInDBError,
} from '../../../errors/errors';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadUrlDto } from '../../../media/media-upload-url.dto';
import { MediaService } from '../../../media/media.service';
import { MulterFile } from '../../../media/multer-file.interface';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { RequestUser } from '../../utils/request-user.decorator';

@Controller('media')
export class MediaController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private mediaService: MediaService,
    private userService: UsersService,
    private noteService: NotesService,
  ) {
    this.logger.setContext(MediaController.name);
  }

  @UseGuards(SessionGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  async uploadMedia(
    @UploadedFile() file: MulterFile,
    @Headers('HedgeDoc-Note') noteId: string,
    @RequestUser() user: User,
  ): Promise<MediaUploadUrlDto> {
    try {
      // TODO: Move getting the Note object into a decorator
      const note: Note = await this.noteService.getNoteByIdOrAlias(noteId);
      this.logger.debug(
        `Recieved filename '${file.originalname}' for note '${noteId}' from user '${user.userName}'`,
        'uploadMedia',
      );
      const url = await this.mediaService.saveFile(file.buffer, user, note);
      return this.mediaService.toMediaUploadUrlDto(url);
    } catch (e) {
      if (e instanceof ClientError || e instanceof NotInDBError) {
        throw new BadRequestException(e.message);
      }
      if (e instanceof MediaBackendError) {
        throw new InternalServerErrorException(
          'There was an error in the media backend',
        );
      }
      throw e;
    }
  }
}
