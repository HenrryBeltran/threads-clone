import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './app.bootstrap';

describe('AppController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        app = await createTestApp();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer()).get('/api/').expect(200).expect('Hello World!');
    });

    afterEach(async () => {
        await app.close();
    });
});
