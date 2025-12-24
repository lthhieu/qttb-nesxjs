'use client'
import { useState } from 'react';
import { Button, Flex, message, Popconfirm, Space, Table, Tag, Tooltip, Modal, Upload, Form } from 'antd';
import type { GetProp, PopconfirmProps, TableProps, UploadFile, UploadProps } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined, EditOutlined, FolderAddOutlined, MinusCircleOutlined, SignatureOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { sendRequest, sendRequestFile } from '@/lib/fetch-wrapper';
import { useRouter } from 'next/navigation';
import DocumentModal from '@/components/documents/modal';
import SignModal from '@/components/documents/sign.modal';
import VersionHistoryButton from '@/components/history/version.history.modal';


interface IProps {
    documents: IDocument[],
    workflows: IWorkflow[],
    access_token: string,
    meta: IMeta
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

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


const TableDocuments = (props: IProps) => {
    const { access_token, meta, documents, workflows } = props
    const [isModalOpen, SetIsModalOpen] = useState(false)
    const [isSignModalOpen, SetIsSignModalOpen] = useState(false)
    const [status, setStatus] = useState('')
    const [dataUpdate, setDataUpdate] = useState<null | IDocument>(null)
    const [uploadModal, setUploadModal] = useState({ visible: false, id: null as string | null });
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm()

    const router = useRouter()

    console.log(workflows)

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

                    <Tooltip title="Xem lịch sử ký">
                        <VersionHistoryButton record={record} />
                    </Tooltip>
                    <Button color="primary" variant="outlined" icon={<SignatureOutlined />}
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

                    {record.cur_status === 'từ chối' && (
                        <Button
                            type="primary"
                            icon={<FolderAddOutlined />}
                            onClick={() => {
                                // Mở modal upload file
                                setUploadModal({ visible: true, id: record._id });
                            }}
                        >
                        </Button>
                    )}

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

    const uploadProps: UploadProps = {
        multiple: false,
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isPDF = file.type === 'application/pdf';
            if (!isPDF) {
                messageApi.open({
                    type: 'error',
                    content: `${file.name} không phải tài liệu PDF`,
                });
                return false;
            }
            setFileList([...fileList, file]);
            return isPDF || Upload.LIST_IGNORE;
        },
        fileList,
    };
    const handleOk = () => {
        form.submit();
    };
    const onFinish = async (values: any) => {
        const link = await handleUpload()
        const response = await sendRequest<IBackendResponse<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/documents/new-version/${uploadModal.id}`,
            method: 'POST',
            body: { new_link: link },
            headers: { Authorization: `Bearer ${access_token}` },
        });
        if (response.data) {
            messageApi.open({
                type: 'success',
                content: response.message,
            });
            setFileList([]);
            handleCancel();
            router.refresh();

        } else {
            console.log(response.error)
        }
    }

    const validateMessages = {
        required: '${label} không được để trống',
    }

    const handleCancel = () => {
        form.resetFields();
        setUploadModal({ visible: false, id: null })
    };
    const handleUpload = async () => {
        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append('file', file as FileType);
        });
        // You can use any AJAX library you like
        const res = await sendRequestFile<IBackendResponse<IFile>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/files/upload`,
            method: 'post',
            body: formData,
            headers: { "folder_type": "documents" }
        })
        if (res.data) {
            return res.data.link
        } else {
            messageApi.open({
                type: 'error',
                content: `${res.message}`,
            });
            return;
        }
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
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kết quả`,
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
            <Modal
                title={"Thêm tài liệu đã chỉnh sửa"}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={uploadModal.visible}
                onCancel={() => setUploadModal({ visible: false, id: null })}
                onOk={handleOk}
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}
            >
                <Form
                    form={form}
                    autoComplete="off"
                    layout='vertical'
                    name="workflow-modal"
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                >
                    <Form.Item
                        style={{ marginBottom: 8 }}
                        label="Tài liệu"
                        name="file"
                        rules={[{ required: true }]}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn tài liệu</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default TableDocuments;