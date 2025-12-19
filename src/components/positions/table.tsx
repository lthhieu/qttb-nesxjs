'use client'
import { useState } from 'react';
import { Button, Flex, message, Popconfirm, Space, Table } from 'antd';
import type { PopconfirmProps, TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, FolderAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { handleDeletePosition } from '@/app/(main)/positions/actions';
import PositionModal from '@/components/positions/modal';


interface IProps {
    positions: IUnit[],
    access_token: string,
    meta: IMeta
}

const TablePositions = (props: IProps) => {
    const { access_token, positions, meta } = props
    const [isModalOpen, SetIsModalOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [dataUpdate, setDataUpdate] = useState<null | IUnit>(null)
    const router = useRouter()


    const showModal = () => {
        setStatus("CREATE")
        SetIsModalOpen(true);
    }
    const [messageApi, contextHolder] = message.useMessage();
    const confirm = (_id: string) => {
        deleteUnit(_id)
    };

    const cancel: PopconfirmProps['onCancel'] = (e) => {
        // console.log(e);
    };

    const deleteUnit = async (_id: string) => {
        const res = await handleDeletePosition(_id, access_token)
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
        }
    }

    const columns: TableProps<IUnit>['columns'] = [
        {
            title: 'Tên chức vụ',
            dataIndex: 'name',
            key: 'name',
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
                    <Button color="green" variant="outlined" icon={<EditOutlined />}
                        onClick={() => {
                            setDataUpdate(record)
                            setStatus("UPDATE")
                            SetIsModalOpen(true)
                        }}
                    ></Button>

                    <Popconfirm
                        title="Xóa chức vụ này?"
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
        router.push(`/positions?page=${page}&limit=${pageSize}`);
    };
    return (
        <>
            {contextHolder}
            <Flex style={{ marginBottom: 16 }} justify='space-between' align='center'>
                <h2>Danh sách chức vụ</h2>
                <Button onClick={showModal} type='primary' icon={<FolderAddOutlined />}>Thêm mới</Button>
            </Flex>
            <Table<IUnit>
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kết quả`,
                    onChange: (page: number, pageSize: number) => handleOnChangePage(page, pageSize),
                    pageSizeOptions: [3, 5, 10],
                    showSizeChanger: true,
                }}
                columns={columns} dataSource={positions} rowKey={"_id"} />
            <PositionModal
                setStatus={setStatus}
                status={status}
                access_token={access_token}
                isModalOpen={isModalOpen}
                setIsModalOpen={SetIsModalOpen}
                //update info
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    )
}

export default TablePositions;