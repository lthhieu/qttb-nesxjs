'use client'
import { useState } from 'react';
import { Button, Flex, message, Popconfirm, Space, Table, Tag } from 'antd';
import type { PopconfirmProps, TableProps } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined, EditOutlined, FolderAddOutlined, MinusCircleOutlined, SignatureOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { sendRequest } from '@/lib/fetch-wrapper';
import { useRouter } from 'next/navigation';
import DocumentModal from '@/components/documents/modal';
import SignModal from '@/components/documents/sign.modal';
import ViewPdf from '@/components/documents/view.pdf';


interface IProps {
    documents: IDocument[],
    workflows: IWorkflow[],
    access_token: string,
    meta: IMeta
}

export const STATUS_MAP: Record<
    string,
    { color: string; icon: React.ReactNode }
> = {
    pending: {
        color: 'warning',
        icon: <MinusCircleOutlined />,
    },
    progress: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
    },
    confirmed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
    },
    rejected: {
        color: 'error',
        icon: <CloseCircleOutlined />,
    },
};


const TableDocuments = (props: IProps) => {
    const { access_token, meta, documents, workflows } = props
    const [isModalOpen, SetIsModalOpen] = useState(false)
    const [isSignModalOpen, SetIsSignModalOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [dataUpdate, setDataUpdate] = useState<null | IDocument>(null)
    const router = useRouter()

    const showModal = () => {
        setStatus("CREATE")
        SetIsModalOpen(true);
    }
    const [messageApi, contextHolder] = message.useMessage();
    const confirm = (_id: string) => {
        deleteDocument(_id)
    };

    const cancel: PopconfirmProps['onCancel'] = (e) => {
        // console.log(e);
    };

    const deleteDocument = async (_id: string) => {
        const res = await sendRequest<IBackendResponse<IDocument>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/documents/${_id}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${access_token!}`,
            },
        })
        if (!res.data) {
            messageApi.open({
                type: 'error',
                content: 'Lỗi xảy ra',
            });
        }
        else {
            messageApi.open({
                type: 'success',
                content: res.message,
            });
            router.refresh()
        }
    }

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

                    {/* <Button color="default" variant="outlined" icon={<DownloadOutlined />}
                        onClick={() => {
                            const link = document.createElement("a");
                            link.href = record.cur_link;              // link file trực tiếp
                            link.download = record.name;               // để trình duyệt tải xuống thay vì mở tab
                            link.target = "_blank";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    ></Button> */}
                    <Button color="default" variant="outlined" icon={<SignatureOutlined />}
                        // onClick={() => {
                        //     console.log("data", record)
                        // }}
                        onClick={() => {
                            setDataUpdate(record)
                            // setStatus("UPDATE")
                            SetIsSignModalOpen(true)
                        }}
                    ></Button>


                    <Button color="green" variant="outlined" icon={<EditOutlined />}
                        onClick={() => {
                            setDataUpdate(record)
                            setStatus("UPDATE")
                            SetIsModalOpen(true)
                        }}
                    ></Button>

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

                    <Popconfirm
                        title="Xóa tài liệu này?"
                        onConfirm={() => confirm(record._id)}
                        onCancel={cancel}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} color="danger" variant="outlined"></Button>
                    </Popconfirm>
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
                {/* <ViewPdf /> */}
                <Button onClick={showModal} type='primary' icon={<FolderAddOutlined />}>Thêm mới</Button>
            </Flex>
            <Table<IDocument>
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    onChange: (page: number, pageSize: number) => handleOnChangePage(page, pageSize),
                    pageSizeOptions: [3, 5, 10],
                    showSizeChanger: true,
                }}
                columns={columns} dataSource={documents} rowKey={"_id"} />
            <DocumentModal
                setStatus={setStatus}
                status={status}
                access_token={access_token}
                isModalOpen={isModalOpen}
                setIsModalOpen={SetIsModalOpen}
                workflows={workflows}
                //update info
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
            <SignModal
                isModalOpen={isSignModalOpen}
                setIsModalOpen={SetIsSignModalOpen}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate ?? null}
                access_token={access_token}
            />
            {/* <PDFJSViewer /> */}
        </>
    )
}

export default TableDocuments;