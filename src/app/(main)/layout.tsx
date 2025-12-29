
import MainLayoutComponent from "@/components/layout/main";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Ký số VLUTE",
    description: "Digital Signature",
};

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <MainLayoutComponent>{children}</MainLayoutComponent>
    );
}
