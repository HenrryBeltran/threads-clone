import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, extractPinFromMailMock } from './app.bootstrap';

describe('Threads (e2e)', () => {
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

        return { user, cookie };
    }

    function getCookieHeader(cookie: string) {
        return { Cookie: cookie };
    }

    beforeAll(async () => {
        app = await createTestApp();
        mailMock = (app as any).mailMock;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/threads/post', () => {
        it('should create a new thread for verified user', async () => {
            const { cookie } = await createVerifiedUser();

            const res = await request(app.getHttpServer())
                .post('/api/threads/post')
                .set(getCookieHeader(cookie))
                .send({ rootId: null, parentId: null, body: [{ text: 'Hello Threads!' }] })
                .expect(201);

            expect(res.body).toHaveLength(1);
            expect(res.body[0].text).toBe('Hello Threads!');
            expect(res.body[0].author.username).toMatch(/^user_/);
            expect(res.body[0].likesCount).toBe(0);
            expect(res.body[0].repliesCount).toBe(0);
        });

        it('should create a thread with multiple body items', async () => {
            const { cookie } = await createVerifiedUser();

            const res = await request(app.getHttpServer())
                .post('/api/threads/post')
                .set(getCookieHeader(cookie))
                .send({
                    rootId: null,
                    parentId: null,
                    body: [{ text: 'First part' }, { text: 'Second part' }],
                })
                .expect(201);

            expect(res.body).toHaveLength(2);
        });

        it('should require authentication (no user → 204 no content)', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/threads/post')
                .send({ rootId: null, parentId: null, body: [{ text: 'No auth' }] });

            expect(res.status).toBe(204);
        });
    });

    describe('GET /api/threads/posts', () => {
        it('should return posts feed', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/threads/posts')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/threads/posts/:userId', () => {
        it('should return posts by user', async () => {
            const { user, cookie } = await createVerifiedUser();

            await request(app.getHttpServer())
                .post('/api/threads/post')
                .set(getCookieHeader(cookie))
                .send({ rootId: null, parentId: null, body: [{ text: 'My thread' }] })
                .expect(201);

            const profileRes = await request(app.getHttpServer()).get(`/api/user/profile/${user.username}`).expect(200);

            if (profileRes.body && profileRes.body.id) {
                const res = await request(app.getHttpServer())
                    .get(`/api/threads/posts/${profileRes.body.id}`)
                    .expect(200);

                expect(Array.isArray(res.body)).toBe(true);
            }
        });
    });

    describe('Likes', () => {
        it('should like and unlike a thread', async () => {
            const { cookie } = await createVerifiedUser();

            const threadRes = await request(app.getHttpServer())
                .post('/api/threads/post')
                .set(getCookieHeader(cookie))
                .send({ rootId: null, parentId: null, body: [{ text: 'Lovable thread' }] })
                .expect(201);

            const postId = threadRes.body[0].id;

            const likeRes = await request(app.getHttpServer())
                .post(`/api/thread/post/like/${postId}`)
                .set(getCookieHeader(cookie))
                .expect(201);

            expect(likeRes.body).toEqual({ like: true });

            const unlikeRes = await request(app.getHttpServer())
                .post(`/api/thread/post/unlike/${postId}`)
                .set(getCookieHeader(cookie))
                .expect(201);

            expect(unlikeRes.body).toEqual({ like: false });
        });

        it('should return 404 when liking a non-existent thread', async () => {
            const { cookie } = await createVerifiedUser();

            const res = await request(app.getHttpServer())
                .post('/api/thread/post/like/nonexistent-thread-id')
                .set(getCookieHeader(cookie))
                .expect(404);

            expect(res.body.message).toContain('Thread not found');
        });
    });

    describe('GET /api/threads/post/:id', () => {
        it('should return thread by id', async () => {
            const { cookie } = await createVerifiedUser();

            const threadRes = await request(app.getHttpServer())
                .post('/api/threads/post')
                .set(getCookieHeader(cookie))
                .send({ rootId: null, parentId: null, body: [{ text: 'Find me' }] })
                .expect(201);

            const id = threadRes.body[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/threads/post/${id}`)
                .expect(200);

            expect(res.body.id).toBe(id);
        });

        it('should return 404 for non-existent thread', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/threads/post/nonexistent-id')
                .expect(404);

            expect(res.body.message).toContain('Thread not found');
        });
    });

    describe('DELETE /api/threads/post/:threadId', () => {
        it('should delete own thread', async () => {
            const { cookie } = await createVerifiedUser();

            const threadRes = await request(app.getHttpServer())
                .post('/api/threads/post')
                .set(getCookieHeader(cookie))
                .send({ rootId: null, parentId: null, body: [{ text: 'Delete me' }] })
                .expect(201);

            const id = threadRes.body[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/api/threads/post/${id}`)
                .set(getCookieHeader(cookie))
                .expect(200);

            expect(res.body.message).toContain('delete successfully');
        });
    });
});
