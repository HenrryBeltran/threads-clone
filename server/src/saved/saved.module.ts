import { Module } from '@nestjs/common';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';
import { SavedRepository } from './saved.repository';
import { PrismaSavedRepository } from './prisma.saved.repository';
import { AuthModule } from 'src/auth/auth.module';
import { CookieService } from 'src/common/cookie.service';

@Module({
    imports: [AuthModule],
    controllers: [SavedController],
    providers: [SavedService, CookieService, { provide: SavedRepository, useClass: PrismaSavedRepository }],
})
export class SavedModule {}
