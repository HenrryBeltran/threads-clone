import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export interface AuthResult {
  cookie: string;
  user: any;
  pin?: string;
}

export async function signupUser(
  app: INestApplication,
  mailMock: ReturnType<typeof import('./app.bootstrap').createMailMock>,
  userData: {
    username: string;
    email: string;
    password: string;
  } = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass123!',
  },
): Promise<AuthResult> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/sign-up')
    .send(userData)
    .expect(201);

  const cookie = res.headers['set-cookie']?.[0]?.split(';')[0]?.replace('st=', '') || '';

  const pin = extractPinFromMailMock(mailMock);

  return { cookie, user: { ...userData, id: res.body?.id }, pin };
}

export async function loginUser(
  app: INestApplication,
  credentials: { username: string; password: string },
): Promise<AuthResult> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send(credentials)
    .expect(200);

  const cookie = res.headers['set-cookie']?.[0]?.split(';')[0]?.replace('st=', '') || '';

  return { cookie, user: credentials };
}

export async function verifyAccount(
  app: INestApplication,
  token: string,
  pin: string,
): Promise<{ cookie: string }> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/verify-account')
    .query({ token })
    .send({ pin })
    .expect(200);

  const cookie = res.headers['set-cookie']?.[0]?.split(';')[0]?.replace('st=', '') || '';

  return { cookie };
}

export async function getAuthUser(app: INestApplication, cookie: string): Promise<any> {
  const res = await request(app.getHttpServer())
    .get('/api/account/user')
    .set('Cookie', [`st=${cookie}`])
    .expect(200);

  return res.body;
}

export async function createThread(
  app: INestApplication,
  cookie: string,
  threadData: { body: Array<{ text: string; resources?: string[] }>; parentId?: string; rootId?: string } = {
    body: [{ text: 'Test thread content' }],
  },
): Promise<any> {
  const res = await request(app.getHttpServer())
    .post('/api/threads/post')
    .set('Cookie', [`st=${cookie}`])
    .send(threadData)
    .expect(201);

  return res.body;
}

export async function likeThread(app: INestApplication, cookie: string, postId: string): Promise<any> {
  const res = await request(app.getHttpServer())
    .post(`/api/thread/post/like/${postId}`)
    .set('Cookie', [`st=${cookie}`])
    .expect(200);

  return res.body;
}

export async function unlikeThread(app: INestApplication, cookie: string, postId: string): Promise<any> {
  const res = await request(app.getHttpServer())
    .post(`/api/thread/post/unlike/${postId}`)
    .set('Cookie', [`st=${cookie}`])
    .expect(200);

  return res.body;
}

export async function followUser(app: INestApplication, cookie: string, username: string): Promise<any> {
  const res = await request(app.getHttpServer())
    .post(`/api/account/profile/follow/${username}`)
    .set('Cookie', [`st=${cookie}`])
    .expect(200);

  return res.body;
}

export async function unfollowUser(app: INestApplication, cookie: string, username: string): Promise<any> {
  const res = await request(app.getHttpServer())
    .post(`/api/account/profile/unfollow/${username}`)
    .set('Cookie', [`st=${cookie}`])
    .expect(200);

  return res.body;
}

export async function saveThread(app: INestApplication, cookie: string, postId: string): Promise<any> {
  const res = await request(app.getHttpServer())
    .post(`/api/thread/post/save/${postId}`)
    .set('Cookie', [`st=${cookie}`])
    .expect(200);

  return res.body;
}

export async function unsaveThread(app: INestApplication, cookie: string, postId: string): Promise<any> {
  const res = await request(app.getHttpServer())
    .post(`/api/thread/post/unsave/${postId}`)
    .set('Cookie', [`st=${cookie}`])
    .expect(200);

  return res.body;
}

export function getAuthHeaders(cookie: string): { Cookie: string } {
  return { Cookie: `st=${cookie}` };
}

function extractPinFromMailMock(mailMock: { sendWelcome: jest.Mock }): string | undefined {
  const calls = mailMock.sendWelcome.mock.calls;
  if (calls.length === 0) return undefined;
  return calls[calls.length - 1][2] as string;
}