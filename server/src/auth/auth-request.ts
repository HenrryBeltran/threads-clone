import { Request } from 'express';
import { AuthUser } from './auth.repository';

export type AuthRequest = Request & { user?: AuthUser; sessionId?: string };
