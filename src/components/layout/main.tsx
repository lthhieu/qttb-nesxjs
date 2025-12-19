'use client'
import { authClient } from '@/lib/auth-client';
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from "next/navigation";

const { Header, Content, Footer } = Layout;

const items = [
    { key: 1, label: <Link href="/">Trang chủ</Link> },
    { key: 2, label: <Link href="/users">Tài khoản</Link> },
    { key: 7, label: <Link href="/positions">Chức vụ</Link> },
    { key: 6, label: <Link href="/units">Đơn vị</Link> },
    { key: 3, label: <Link href="/documents">Văn bản</Link> },
    { key: 4, label: <Link href="/workflows">Quy trình</Link> },
    { key: 5, label: <Link href="/histories">Lịch sử</Link> },
]

const itemsNotLogin = [
    { key: 1, label: <Link href="/">Trang chủ</Link> },
]

const itemsUsers = [
    { key: 1, label: <Link href="/">Trang chủ</Link> },
    { key: 3, label: <Link href="/documents">Văn bản</Link> },
    { key: 4, label: <Link href="/workflows">Quy trình</Link> },
    { key: 5, label: <Link href="/histories">Lịch sử</Link> },
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

    console.log(session)

    const handleSignout = async () => {
        await authClient.signOut();
        return redirect('/')
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
                    //@ts-ignore
                    items={session ? session.user.role === '692027387acdfd5a8a9691ad' ? items : itemsUsers : itemsNotLogin}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <div>{session ? <div style={{ display: 'flex', gap: 16 }}>
                    <span>{session.user.email}</span>
                    <LogoutOutlined onClick={handleSignout} style={{ cursor: 'pointer', fontSize: 24, color: '#363434ff' }} />
                </div> : <Link href={'/login'}><LoginOutlined style={{ cursor: 'pointer', fontSize: 24, color: '#363434ff' }} /></Link>}</div>
            </Header>
            <Content style={{ padding: '0 48px', margin: '32px 0' }}>
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 'calc(100vh - 35vh)',
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
