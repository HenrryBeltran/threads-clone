import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchRepository } from './search.repository';
import { PrismaSearchRepository } from './prisma.search.repository';
import { AuthModule } from 'src/auth/auth.module';
import { CookieService } from 'src/common/cookie.service';

@Module({
    imports: [AuthModule],
    controllers: [SearchController],
    providers: [SearchService, CookieService, { provide: SearchRepository, useClass: PrismaSearchRepository }],
})
export class SearchModule {}
