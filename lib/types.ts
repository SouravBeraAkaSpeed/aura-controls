import { DefaultSession, DefaultUser } from "next-auth";



export interface CustomUser extends DefaultUser {
    _id: string;
    email: string;
    password: string;
}

export interface CustomSession extends DefaultSession {
    user: CustomUser & DefaultSession["user"] & { id: string };
}