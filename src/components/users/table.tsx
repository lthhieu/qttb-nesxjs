'use client'
import { useState } from 'react';
import { Button, Flex, message, Popconfirm, Space, Table, Typography } from 'antd';
import type { PopconfirmProps, TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, FolderAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { handleDeleteUser } from '@/app/(main)/users/actions';
import UserModal from '@/components/users/modal';


interface IProps {
    users: IUser[],
    units: IUnit[],
    roles: IUnit[],
    positions: IUnit[],
    access_token: string,
    meta: IMeta
}

const TableUsers = (props: IProps) => {
    const { users, access_token, units, positions, meta, roles } = props
    const [isModalOpen, SetIsModalOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [dataUpdate, setDataUpdate] = useState<null | IUser>(null)
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();

    const showModal = () => {
        setStatus("CREATE")
        SetIsModalOpen(true);
    }
    const confirm = (_id: string) => {
        deleteUser(_id)
    };

    const cancel: PopconfirmProps['onCancel'] = (e) => {
        // console.log(e);
    };

    const deleteUser = async (_id: string) => {
        const res = await handleDeleteUser(_id, access_token)
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

    const columns: TableProps<IUser>['columns'] = [
        {
            title: 'Tên tài khoản',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            responsive: ['md'],
        },
        {
            title: 'Quyền hạn',
            dataIndex: 'role',
            key: 'role',
            responsive: ['lg'],
            render: (_, record) => (
                <Typography>{roles.find(({ _id }) => _id === record.role)?.name}</Typography>
            )
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
                        title="Xóa tài khoản này?"
                        description={`Bạn thực sự muốn xóa tài khoản ${record.email}`}
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
        router.push(`/users?page=${page}&limit=${pageSize}`);
    };

    return (
        <>
            {contextHolder}
            <Flex style={{ marginBottom: 16 }} justify='space-between' align='center'>
                <h2>Danh sách tài khoản</h2>
                <Button onClick={showModal} type='primary' icon={<FolderAddOutlined />}>Thêm mới</Button>
            </Flex>
            <Table<IUser>
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kết quả`,
                    onChange: (page: number, pageSize: number) => handleOnChangePage(page, pageSize),
                    pageSizeOptions: [3, 5, 10],
                    showSizeChanger: true,
                }}
                columns={columns} dataSource={users} rowKey={"_id"} />
            <UserModal
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
                roles={roles}
            />
        </>
    )
}

export default TableUsers;