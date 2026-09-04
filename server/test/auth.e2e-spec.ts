import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, extractPinFromMailMock } from './app.bootstrap';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let mailMock: ReturnType<typeof createTestApp> extends never ? never : any;

    const unique = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    const testUser = () => ({
        username: `user_${unique()}`,
        email: `${unique()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
    });

    beforeAll(async () => {
        app = await createTestApp();
        mailMock = (app as any).mailMock;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/auth/sign-up', () => {
        it('should create a new user and return a verification token', async () => {
            const user = testUser();

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send(user)
                .expect(201);

            expect(res.body).toHaveProperty('token');
            expect(typeof res.body.token).toBe('string');
        });

        it('should set a session cookie', async () => {
            const user = testUser();

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send(user)
                .expect(201);

            const setCookie = res.headers['set-cookie'];
            expect(setCookie).toBeDefined();
            expect(setCookie.some((c: string) => c.startsWith('st='))).toBe(true);
        });

        it('should send a welcome email with a 6-digit PIN', async () => {
            const user = testUser();

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send(user)
                .expect(201);

            const pin = extractPinFromMailMock(mailMock);
            expect(pin).toMatch(/^\d{6}$/);
        });

        it('should return 409 if username already exists', async () => {
            const user = testUser();

            await request(app.getHttpServer()).post('/api/auth/sign-up').send(user).expect(201);

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send({ ...user, email: `${unique()}@example.com` })
                .expect(409);

            expect(res.body.message).toContain('already taken');
        });

        it('should return 409 if email already exists', async () => {
            const user = testUser();

            await request(app.getHttpServer()).post('/api/auth/sign-up').send(user).expect(201);

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send({ ...user, username: `other_${unique()}` })
                .expect(409);

            expect(res.body.message).toContain('already register');
        });

        it('should return 400 for invalid username (spaces)', async () => {
            const user = testUser();

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send({ ...user, username: 'bad username' })
                .expect(400);

            expect(res.body.message).toBeDefined();
        });

        it('should return 400 for weak password', async () => {
            const user = testUser();

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send({ ...user, password: 'weak', confirmPassword: 'weak' })
                .expect(400);

            expect(res.body.message).toBeDefined();
        });

        it('should return 400 for mismatched passwords', async () => {
            const user = testUser();

            const res = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send({ ...user, confirmPassword: 'DifferentPass123!' })
                .expect(400);

            expect(res.body.message).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with username and password', async () => {
            const user = testUser();

            const signupRes = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send(user)
                .expect(201);

            const token = signupRes.body.token as string;
            const pin = extractPinFromMailMock(mailMock) as string;
            const cookie = signupRes.headers['set-cookie'][0].split(';')[0];

            await request(app.getHttpServer())
                .post('/api/auth/verify-account/')
                .query({ token })
                .set('Cookie', [cookie])
                .send({ pin })
                .expect(201);

            const res = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ username: user.username, password: user.password })
                .expect(200);

            expect(Number(res.text)).toBe(200);
        });

        it('should return 307 with verification token for unverified account', async () => {
            const user = testUser();

            await request(app.getHttpServer()).post('/api/auth/sign-up').send(user).expect(201);

            const res = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ username: user.username, password: user.password })
                .expect(307);

            expect(res.body).toHaveProperty('token');
        });

        it('should return 404 if username not found', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ username: `nouser_${unique()}`, password: 'TestPassword123!' })
                .expect(404);

            expect(res.body.message).toContain('not found');
        });

        it('should return 404 if email not found', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ username: `${unique()}@nonexistent.com`, password: 'TestPassword123!' })
                .expect(404);

            expect(res.body.message).toContain('not found');
        });

        it('should return 401 for wrong password', async () => {
            const user = testUser();

            await request(app.getHttpServer()).post('/api/auth/sign-up').send(user).expect(201);

            const res = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ username: user.username, password: 'WrongPass123!' })
                .expect(401);

            expect(res.body.message).toContain('Wrong password');
        });
    });

    describe('Account verification flow', () => {
        it('should verify account with captured PIN', async () => {
            const user = testUser();

            const signupRes = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send(user)
                .expect(201);

            const token = signupRes.body.token as string;
            const pin = extractPinFromMailMock(mailMock) as string;

            const cookie = signupRes.headers['set-cookie'][0].split(';')[0];

            const verifyRes = await request(app.getHttpServer())
                .post('/api/auth/verify-account/')
                .query({ token })
                .set('Cookie', [cookie])
                .send({ pin })
                .expect(201);

            expect(verifyRes.text).toBe('Account verify successfully');
        });

        it('should return 406 for wrong PIN', async () => {
            const user = testUser();

            const signupRes = await request(app.getHttpServer())
                .post('/api/auth/sign-up')
                .send(user)
                .expect(201);

            const token = signupRes.body.token as string;
            const cookie = signupRes.headers['set-cookie'][0].split(';')[0];

            const res = await request(app.getHttpServer())
                .post('/api/auth/verify-account/')
                .query({ token })
                .set('Cookie', [cookie])
                .send({ pin: '000000' })
                .expect(406);

            expect(res.body.message).toContain('Pin not valid');
        });
    });
});
