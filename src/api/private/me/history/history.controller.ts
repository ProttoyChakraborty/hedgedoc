/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ForbiddenIdError, NotInDBError } from '../../../../errors/errors';
import { HistoryEntryImportDto } from '../../../../history/history-entry-import.dto';
import { HistoryEntryUpdateDto } from '../../../../history/history-entry-update.dto';
import { HistoryEntryDto } from '../../../../history/history-entry.dto';
import { HistoryService } from '../../../../history/history.service';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { GetNotePipe } from '../../../../notes/get-note.pipe';
import { Note } from '../../../../notes/note.entity';
import { UsersService } from '../../../../users/users.service';

@ApiTags('history')
@Controller('/me/history')
export class HistoryController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private historyService: HistoryService,
    private userService: UsersService,
  ) {
    this.logger.setContext(HistoryController.name);
  }

  @Get()
  async getHistory(): Promise<HistoryEntryDto[]> {
    // ToDo: use actual user here
    try {
      const user = await this.userService.getUserByUsername('hardcoded');
      const foundEntries = await this.historyService.getEntriesByUser(user);
      return foundEntries.map((entry) =>
        this.historyService.toHistoryEntryDto(entry),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Post()
  async setHistory(
    @Body('history') history: HistoryEntryImportDto[],
  ): Promise<void> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      await this.historyService.setHistory(user, history);
    } catch (e) {
      if (e instanceof NotInDBError || e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Delete()
  async deleteHistory(): Promise<void> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      await this.historyService.deleteHistory(user);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Put(':note')
  async updateHistoryEntry(
    @Param('note', GetNotePipe) note: Note,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const newEntry = await this.historyService.updateHistoryEntry(
        note,
        user,
        entryUpdateDto,
      );
      return this.historyService.toHistoryEntryDto(newEntry);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Delete(':note')
  async deleteHistoryEntry(
    @Param('note', GetNotePipe) note: Note,
  ): Promise<void> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      await this.historyService.deleteHistoryEntry(note, user);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
