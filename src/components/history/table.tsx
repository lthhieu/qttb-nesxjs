'use client'
import { useState } from 'react';
import { Button, Flex, message, Popconfirm, Space, Table, Tag } from 'antd';
import type { PopconfirmProps, TableProps } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined, EditOutlined, FolderAddOutlined, MinusCircleOutlined, SignatureOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import SignModal from '@/components/documents/sign.modal';


interface IProps {
    documents: IDocument[],
    access_token: string,
    meta: IMeta
}

export const STATUS_MAP: Record<
    string,
    { color: string; icon: React.ReactNode }
> = {
    'vừa tải lên': {
        color: 'warning',
        icon: <MinusCircleOutlined />,
    },
    'đang trình ký': {
        color: 'processing',
        icon: <ClockCircleOutlined />,
    },
    'đã hoàn thành': {
        color: 'success',
        icon: <CheckCircleOutlined />,
    },
    'từ chối': {
        color: 'error',
        icon: <CloseCircleOutlined />,
    },
};


const TableDocumentsConfirm = (props: IProps) => {
    const { access_token, meta, documents } = props
    const [isModalOpen, SetIsModalOpen] = useState(false)
    const [isSignModalOpen, SetIsSignModalOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [dataUpdate, setDataUpdate] = useState<null | IDocument>(null)
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();

    const cancel: PopconfirmProps['onCancel'] = (e) => {
        // console.log(e);
    };

    const columns: TableProps<IDocument>['columns'] = [
        {
            title: 'Tên tài liệu',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Phiên bản',
            dataIndex: 'cur_version',
            key: 'cur_version',
            responsive: ['md'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'cur_status',
            key: 'cur_status',
            render: (text) => {
                console.log(text)
                const item = STATUS_MAP[text];
                return (
                    <Tag icon={item.icon} color={item.color}>
                        {text}
                    </Tag>
                );
            },
            responsive: ['md'],
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
            responsive: ['lg'],
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        color="pink"
                        variant="outlined"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                            const link = document.createElement("a")
                            link.href = record.cur_link
                            link.download = record.name || "document.pdf"   // đặt tên file tùy ý
                            link.click()
                        }}
                    ></Button>
                </Space>
            ),
        },
    ];
    const handleOnChangePage = (page: number, pageSize: number) => {
        router.push(`/documents?page=${page}&limit=${pageSize}`);
    };
    return (
        <>
            {contextHolder}
            <Flex style={{ marginBottom: 16 }} justify='space-between' align='center'>
                <h2>Danh sách tài liệu</h2>
            </Flex>
            <Table<IDocument>
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kết quả`,
                    onChange: (page: number, pageSize: number) => handleOnChangePage(page, pageSize),
                    pageSizeOptions: [3, 5, 10],
                    showSizeChanger: true,
                }}
                columns={columns} dataSource={documents} rowKey={"_id"} />
            <SignModal
                isModalOpen={isSignModalOpen}
                setIsModalOpen={SetIsSignModalOpen}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate ?? null}
                access_token={access_token}
            />
        </>
    )
}

export default TableDocumentsConfirm;