import TestPAge from '@/app/components/test';
import { auth } from '@/lib/auth';
import { Button } from 'antd';
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
            trang chủ
            <TestPAge/>
        </div>
    );
}
