import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { SearchRepository, SearchResultRow, SearchHistoryRow } from './search.repository';

@Injectable()
export class SearchService {
    constructor(private readonly repo: SearchRepository) {}

    async search(userId: string, keywords: string): Promise<SearchResultRow[]> {
        let rows: SearchResultRow[] = [];
        try {
            rows = await this.repo.searchUsers(userId, keywords);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getHistory(userId: string): Promise<SearchHistoryRow[]> {
        let rows: SearchHistoryRow[] = [];
        try {
            rows = await this.repo.findHistory(userId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async addHistory(userId: string, targetId: string, response: Response): Promise<void> {
        let duplicate: { id: string } | null = null;
        try {
            duplicate = await this.repo.findDuplicate(userId, targetId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (duplicate) {
            try {
                await this.repo.touchHistory(duplicate.id);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
            response.json(200);
            return;
        }

        try {
            await this.repo.addHistory(userId, targetId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        response.json(200);
    }

    async clearHistory(userId: string, response: Response): Promise<void> {
        try {
            await this.repo.clearHistory(userId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        response.json(200);
    }

    async deleteRow(rowId: string, response: Response): Promise<void> {
        try {
            await this.repo.deleteRow(rowId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        response.json(200);
    }
}
