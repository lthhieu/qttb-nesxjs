'use client'
import { Button, Form, Grid, Input, theme, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export default function LoginComponent() {
    const { token } = useToken();
    const screens = useBreakpoint();

    const onFinish = async (values: any) => {
        console.log("Received values of form: ", values);
    };

    const styles = {
        container: {
            margin: "0 auto",
            padding: screens.md ? `${token.paddingXL}px` : `${token.sizeXXL}px ${token.padding}px`,
            width: "380px",
        },
        footer: {
            marginTop: token.marginMD,
            width: "100%",
            textAlign: "center" as const,
            color: '#1677ff'
        },
        forgotPassword: {
            float: "right" as const
        },
        image: {
            display: 'flex',
            justifyContent: "center",
        },
        header: {
            marginBottom: token.marginXL,
            textAlign: "center" as const,
        },
        section: {
            alignItems: "center",
            backgroundColor: token.colorBgContainer,
            display: "flex",
            height: screens.sm ? "100vh" : "auto",
            padding: screens.md ? `${token.sizeXXL}px 0px` : "0px"
        },
        text: {
            color: token.colorTextSecondary
        },
        title: {
            fontSize: screens.md ? token.fontSizeHeading2 : token.fontSizeHeading3
        }
    };

    const handleSigninGG = async () => {
        await authClient.signIn.social({
            provider: 'google'
        })
    }

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <div style={styles.image}>
                    <Image alt="logo" src={'/logo.png'} width={64} height={64} />
                </div>
                <div style={styles.header}>
                    <Title style={styles.title}>Hệ Thống Chữ Ký Số</Title>
                </div>
                {/* <Form
                    name="login form"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark="optional"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                type: "email",
                                required: true,
                                message: "Please input your Email!",
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Password!",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: "0px" }}>
                        <Button block={true} type="primary" htmlType="submit">
                            Đăng nhập
                        </Button>
                        <div style={styles.footer}>
                            <Text style={styles.text}>Bạn chưa có tài khoản?</Text>{" "}
                            <Link onClick={() => { handleSigninGG() }} href="">Hãy đăng ký với Google</Link>
                        </div>
                    </Form.Item>
                </Form> */}
                <Button onClick={() => { handleSigninGG() }} block={true} type="primary">
                    Đăng nhập với tài khoản vlute.edu.vn
                </Button>
                <div style={styles.footer}>
                    <Link href="/">Quay về trang chủ</Link>
                </div>
            </div>
        </section>
    );
}