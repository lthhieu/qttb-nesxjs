import { APIError, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { createAuthMiddleware, customSession } from "better-auth/plugins";
import { sendRequest } from "@/lib/fetch-wrapper";
import { inferAdditionalFields } from "better-auth/client/plugins";

const client = new MongoClient(process.env.MONGO_URI!);
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db, { client }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            // async mapProfileToUser(profile) {
            //     if (profile.email !== 'hieu@vlute.edu.vn') {
            //         throw new Error('mail không tồn tại trong dữ liệu!')
            //     }
            // },
        },
    },
    plugins: [
        customSession(async ({ user, session }) => {
            const { email, name, image } = user;
            const response = await sendRequest<IBackendResponse<IAuth<IUser>>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login-by-social`,
                method: 'post',
                body: { email, name, image },
            })
            if (!response.error) {
                return {
                    user: {
                        ...user,
                        id: response.data?.user._id,
                        role: response.data?.user.role,
                        p12: response.data?.user.p12
                    },
                    access_token: response.data?.access_token,
                    refresh_token: response.data?.refresh_token,
                    session
                };
            }
            return {
                user,
                session
            };
        }),
    ],
});