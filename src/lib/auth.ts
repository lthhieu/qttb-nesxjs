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

            try {
                const response = await sendRequest<IBackendResponse<IAuth<IUser>>>({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/login-by-social`,
                    method: 'post',
                    body: { email, name, image },
                });

                // Nếu backend không tìm thấy user (email không tồn tại trong DB)
                if (response.error || !response.data) {
                    // BẮN THÔNG BÁO LỖI ĐẸP
                    if (typeof window !== "undefined") {
                        const { message } = await import("antd");
                        message.error(
                            response.message || "Tài khoản Google này chưa được đăng ký trong hệ thống. Vui lòng liên hệ admin!"
                        );
                    }

                    // TỰ ĐỘNG SIGNOUT NGAY LẬP TỨC – DÙNG CLIENT INSTANCE
                    if (typeof window !== "undefined") {
                        const { authClient } = await import("@/lib/auth-client"); // ← import client instance
                        await authClient.signOut();
                    }

                    // Trả về null để chặn login hoàn toàn
                    return null;
                }

                // Thành công → trả về user đầy đủ
                return {
                    user: {
                        ...user,
                        id: response.data?.user._id,
                        role: response.data?.user.role,
                        p12: response.data?.user.p12,
                    },
                    access_token: response.data?.access_token,
                    refresh_token: response.data?.refresh_token,
                    session,
                };
            } catch (err) {
                // Lỗi mạng hoặc server
                if (typeof window !== "undefined") {
                    const { message } = await import("antd");
                    message.error("Lỗi kết nối server. Vui lòng thử lại sau!");

                    const { authClient } = await import("@/lib/auth-client");
                    await authClient.signOut();
                }
                return null;
            }
        }),
    ],
});