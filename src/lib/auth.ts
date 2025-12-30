import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { customSession } from "better-auth/plugins";
import { sendRequest } from "@/lib/fetch-wrapper";

const client = new MongoClient(process.env.MONGO_URI!);
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db, { client, transaction: false }),
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    trustedOrigins: [process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string],
    plugins: [
        customSession(async ({ user, session }) => {
            const { email, name, image } = user;

            const response = await sendRequest<IBackendResponse<IAuth<IUser>>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login-by-social`,
                method: "post",
                body: { email, name, image },
            });

            if (response.data) {
                return {
                    user: {
                        ...user,
                        id: response.data.user._id,
                        role: response.data.user.role,
                        p12: response.data.user.p12,
                    },
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                    session,
                };
            }
            return { user, session };
        })
    ],
});