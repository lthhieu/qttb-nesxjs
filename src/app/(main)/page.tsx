import TestPAge from '@/components/test';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    // console.log("check session server:", session)
    return (
        <div>
            {/* <Button size='small' type="primary">Button</Button>
      <TestPAge /> */}
            Trang chủ
            <TestPAge />
        </div>
    );
}
