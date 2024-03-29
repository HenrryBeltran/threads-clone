// Generated by Xata Codegen 0.29.3. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "user",
    columns: [
      { name: "bio", type: "string" },
      {
        name: "sessions",
        type: "link",
        link: { table: "session" },
        unique: true,
      },
      { name: "profile_picture", type: "file" },
      { name: "name", type: "string" },
      { name: "password", type: "string", notNull: true, defaultValue: "" },
      { name: "email", type: "email", unique: true },
      { name: "username", type: "string", unique: true },
      { name: "email_verified", type: "datetime" },
    ],
  },
  {
    name: "session",
    columns: [
      { name: "expires", type: "datetime", notNull: true, defaultValue: "now" },
      { name: "session_token", type: "string", unique: true },
    ],
    revLinks: [{ column: "sessions", table: "user" }],
  },
  {
    name: "reset_password",
    columns: [
      { name: "expires", type: "datetime", notNull: true, defaultValue: "now" },
      { name: "email", type: "email" },
      { name: "password_token", type: "string", unique: true },
    ],
  },
  {
    name: "verify_user",
    columns: [
      { name: "user_token", type: "string", unique: true },
      { name: "expires", type: "datetime", notNull: true, defaultValue: "now" },
      { name: "email", type: "email", unique: true },
      {
        name: "code_verified",
        type: "string",
        notNull: true,
        defaultValue: "",
      },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type User = InferredTypes["user"];
export type UserRecord = User & XataRecord;

export type Session = InferredTypes["session"];
export type SessionRecord = Session & XataRecord;

export type ResetPassword = InferredTypes["reset_password"];
export type ResetPasswordRecord = ResetPassword & XataRecord;

export type VerifyUser = InferredTypes["verify_user"];
export type VerifyUserRecord = VerifyUser & XataRecord;

export type DatabaseSchema = {
  user: UserRecord;
  session: SessionRecord;
  reset_password: ResetPasswordRecord;
  verify_user: VerifyUserRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Henrry-s-workspace-eilp77.us-east-1.xata.sh/db/threads-clone",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
