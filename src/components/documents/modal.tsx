"use client"
import { Modal, Form, Input, message, Upload, Button, Select, Typography, Space, Tag } from 'antd';
import { sendRequest, sendRequestFile } from '@/lib/fetch-wrapper';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { authClient } from '@/lib/auth-client';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import dayjs from 'dayjs';
import { STATUS_MAP } from '@/components/documents/table';


type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface IProps {
    access_token?: string,
    units?: IUnit[],
    positions?: IUnit[],
    isModalOpen: boolean,
    setIsModalOpen: (value: boolean) => void,
    status: string,
    setStatus: (value: string) => void,
    workflows: IWorkflow[]
    //update
    dataUpdate?: null | IDocument,
    setDataUpdate: (value: null | IDocument) => void
}

const DocumentModal = (props: IProps) => {
    const { setIsModalOpen, isModalOpen, setStatus, status, access_token, workflows, dataUpdate, setDataUpdate } = props
    const [form] = Form.useForm()
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const item = STATUS_MAP[dataUpdate?.cur_status ?? 'pending'];
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession()


    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
                workflow: dataUpdate.workflow,
                // steps: dataUpdate.steps,
                _id: dataUpdate._id
            })
        }
    }, [dataUpdate])

    const handleOk = () => {
        form.submit();
    };

    const handleCancel = () => {
        form.resetFields();
        setStatus("")
        setDataUpdate(null)
        setIsModalOpen(false);
    };

    const onFinish = async (values: any) => {
        const { name, workflow } = values
        const link = status === "CREATE" ? await handleUpload(workflow) : ''
        const response = await sendRequest<IBackendResponse<IDocument>>({
            url: status === "CREATE" ? `${process.env.NEXT_PUBLIC_BACKEND_URI}/documents` : `${process.env.NEXT_PUBLIC_BACKEND_URI}/documents/${dataUpdate?._id}`,
            method: status === "CREATE" ? "POST" : "PATCH",
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            body: status === "CREATE" ? { name, workflow, link } : { name }
        })
        if (response.data) {
            messageApi.open({
                type: 'success',
                content: response.message,
            });
            setFileList([]);
            handleCancel()
            router.refresh()

        } else {
            console.log(response.error)
        }
    }

    const validateMessages = {
        required: '${label} không được để trống',
    }

    const onChange = (value: string) => {
        console.log(`selected ${value}`);
    };

    const onSearch = (value: string) => {
        console.log('search:', value);
    };

    const handleUpload = async (workflow: string) => {
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

    return (
        <>
            {contextHolder}
            <Modal
                title={status === "CREATE" ? "Thêm Tài liệu" : "Cập nhật Tài liệu"}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
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
                        label="Tên Tài liệu"
                        name="name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        style={{ marginBottom: 8 }}
                        label="Loại quy trình"
                        name="workflow"
                        rules={[{ required: true }]}
                    >
                        <Select
                            disabled={status === "CREATE" ? false : true}
                            showSearch
                            placeholder="Chọn quy trình"
                            optionFilterProp="label"
                            onChange={onChange}
                            onSearch={onSearch}
                            options={workflows.length > 0 ? workflows.map(({ _id, name }) => ({
                                value: _id,
                                label: name
                            })) : []
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        style={{ marginBottom: 8 }}
                        label="Tài liệu"
                        name="file"
                        rules={[{ required: status === "CREATE" ? true : false }]}
                        hidden={status === "CREATE" ? false : true}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>
                </Form>
                {status === 'UPDATE' &&
                    <>
                        <Space style={{ marginTop: 4 }}>
                            <Typography>Trạng thái</Typography>
                            <Tag icon={item.icon} color={item.color}>
                                {dataUpdate?.cur_status}
                            </Tag>
                        </Space>
                        <br />
                        <Space style={{ marginTop: 8 }}>
                            <Typography>Ngày tạo</Typography>
                            <Typography>{dayjs(dataUpdate?.createdAt).format('DD/MM/YYYY')}</Typography>
                        </Space>
                    </>}
            </Modal>
        </>
    );
};

export default DocumentModal;