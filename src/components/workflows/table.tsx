'use client'
import { useState } from 'react';
import { Button, Flex, message, Popconfirm, Space, Table } from 'antd';
import type { PopconfirmProps, TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, FolderAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import WorkflowModal from '@/components/workflows/modal';
import { sendRequest } from '@/lib/fetch-wrapper';
import { useRouter } from 'next/navigation';


interface IProps {
    workflows: IWorkflow[],
    units: IUnit[],
    positions: IUnit[],
    access_token: string,
    meta: IMeta
}

const TableWorkflows = (props: IProps) => {
    const { workflows, access_token, units, positions, meta } = props
    const [isModalOpen, SetIsModalOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [dataUpdate, setDataUpdate] = useState<null | IWorkflow>(null)
    const router = useRouter()


    const showModal = () => {
        setStatus("CREATE")
        SetIsModalOpen(true);
    }
    const [messageApi, contextHolder] = message.useMessage();
    const confirm = (_id: string) => {
        deleteUser(_id)
    };

    const cancel: PopconfirmProps['onCancel'] = (e) => {
        // console.log(e);
    };

    const deleteUser = async (_id: string) => {
        const res = await sendRequest<IBackendResponse<IWorkflow>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows/${_id}`,
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

    const columns: TableProps<IWorkflow>['columns'] = [
        {
            title: 'Tên quy trình',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Phiên bản',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button color="green" variant="outlined" icon={<EditOutlined />}
                        onClick={() => {
                            setDataUpdate(record)
                            setStatus("UPDATE")
                            SetIsModalOpen(true)
                        }}
                    ></Button>

                    <Popconfirm
                        title="Xóa Quy trình này?"
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
        router.push(`/workflows?page=${page}&limit=${pageSize}`);
    };
    return (
        <>
            {contextHolder}
            <Flex style={{ marginBottom: 16 }} justify='space-between' align='center'>
                <h2>Danh sách quy trình</h2>
                <Button onClick={showModal} type='primary' icon={<FolderAddOutlined />}>Thêm mới</Button>
            </Flex>
            <Table<IWorkflow>
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    onChange: (page: number, pageSize: number) => handleOnChangePage(page, pageSize),
                    pageSizeOptions: [3, 5, 10],
                    showSizeChanger: true,
                }}
                columns={columns} dataSource={workflows} rowKey={"_id"} />
            <WorkflowModal
                setStatus={setStatus}
                status={status}
                access_token={access_token}
                isModalOpen={isModalOpen}
                setIsModalOpen={SetIsModalOpen}
                //update info
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
                units={units}
                positions={positions}
            />
        </>
    )
}

export default TableWorkflows;