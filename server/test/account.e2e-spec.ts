import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, extractPinFromMailMock } from './app.bootstrap';

describe('Account (e2e)', () => {
    let app: INestApplication;
    let mailMock: any;

    const unique = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    const testUser = () => ({
        username: `user_${unique()}`,
        email: `${unique()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
    });

    async function createVerifiedUser() {
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

        return { user, cookie, id: signupRes.body.id };
    }

    function cookieHeader(cookie: string) {
        return { Cookie: cookie };
    }

    beforeAll(async () => {
        app = await createTestApp();
        mailMock = (app as any).mailMock;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/account/user', () => {
        it('should return current user info', async () => {
            const { user, cookie } = await createVerifiedUser();

            const res = await request(app.getHttpServer())
                .get('/api/account/user/')
                .set(cookieHeader(cookie))
                .expect(200);

            expect(res.body.username).toBe(user.username);
            expect(res.body.email).toBe(user.email);
        });
    });

    describe('PUT /api/account/user', () => {
        it('should update profile name and bio', async () => {
            const { cookie } = await createVerifiedUser();

            const res = await request(app.getHttpServer())
                .put('/api/account/user/')
                .set(cookieHeader(cookie))
                .send({ name: 'Updated Name', bio: 'My new bio', link: '' })
                .expect(200);

            expect(Number(res.text)).toBe(200);
        });
    });

    describe('POST /api/account/user/username', () => {
        it('should update username', async () => {
            const { cookie } = await createVerifiedUser();

            const res = await request(app.getHttpServer())
                .post('/api/account/user/username')
                .set(cookieHeader(cookie))
                .send({ newUsername: `newname_${unique()}` })
                .expect(201);

            expect(res.body.message).toBe('New username updated successfully');
        });

        it('should return 409 if username taken', async () => {
            const user1 = await createVerifiedUser();
            const user2 = await createVerifiedUser();

            const res = await request(app.getHttpServer())
                .post('/api/account/user/username')
                .set(cookieHeader(user2.cookie))
                .send({ newUsername: user1.user.username })
                .expect(409);

            expect(res.body.message).toContain('already taken');
        });
    });

    describe('Follows', () => {
        it('should follow and unfollow another user', async () => {
            const follower = await createVerifiedUser();
            const target = await createVerifiedUser();

            const followRes = await request(app.getHttpServer())
                .post(`/api/account/profile/follow/${target.user.username}`)
                .set(cookieHeader(follower.cookie))
                .expect(201);

            expect(followRes.body).toEqual({ follow: true });

            const unfollowRes = await request(app.getHttpServer())
                .post(`/api/account/profile/unfollow/${target.user.username}`)
                .set(cookieHeader(follower.cookie))
                .expect(201);

            expect(unfollowRes.body).toEqual({ follow: false });
        });

        it('should return follow status', async () => {
            const follower = await createVerifiedUser();
            const target = await createVerifiedUser();

            await request(app.getHttpServer())
                .post(`/api/account/profile/follow/${target.user.username}`)
                .set(cookieHeader(follower.cookie))
                .expect(201);

            const getRes = await request(app.getHttpServer())
                .get(`/api/account/profile/follow/${target.user.username}`)
                .set(cookieHeader(follower.cookie))
                .expect(200);

            expect(getRes.body).toEqual({ follow: true });
        });
    });
});
