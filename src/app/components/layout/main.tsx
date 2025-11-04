'use client'
import { authClient } from '@/lib/auth-client';
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import Image from 'next/image';
import Link from 'next/link';

const { Header, Content, Footer } = Layout;

const items = [
    { key: 1, label: <Link href="/">Người dùng</Link> },
    { key: 2, label: <Link href="/documents">Văn bản</Link> },
    { key: 3, label: <Link href="/histories">Lịch sử</Link> },
]

export default function MainLayoutComponent({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const styles = {
        header: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colorBgContainer,
        },
        image: {
            display: 'flex',
            justifyContent: "center",
            marginRight: 24
        },
    };

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession()

    const handleSignout = async () => {
        await authClient.signOut();
    }

    return (
        <Layout>
            <Header style={styles.header}>
                <Link href={'/'} style={styles.image}>
                    <Image alt="logo" src={'/logo.png'} width={32} height={32} />
                </Link>
                <Menu
                    theme="light"
                    mode="horizontal"
                    defaultSelectedKeys={['1']}
                    items={items}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <div>{session ? <div style={{ display: 'flex', gap: 16 }}>
                    <span>{session.user.email}</span>
                    <LogoutOutlined onClick={handleSignout} style={{ cursor: 'pointer', fontSize: 24, color: '#363434ff' }} />
                </div> : <Link href={'/login'}><LoginOutlined onClick={handleSignout} style={{ cursor: 'pointer', fontSize: 24, color: '#363434ff' }} /></Link>}</div>
            </Header>
            <Content style={{ padding: '0 48px', margin: '32px 0' }}>
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 350,
                        padding: 24,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                {/* Trường Đại học Sư phạm Kỹ thuật Vĩnh Long ©{new Date().getFullYear()} */}
                Trường Đại học Sư phạm Kỹ thuật Vĩnh Long ©2025
            </Footer>
        </Layout>
    );
}
