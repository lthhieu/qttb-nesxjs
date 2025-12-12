"use client"
import { Modal, Form, Input, message, Select, Upload, Button } from 'antd';
import { useEffect, useState } from 'react';
import { handleCreateOrUpdateUser, handleUploadFileP12 } from '@/app/(main)/users/actions';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { DownloadOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import { sendRequestFile } from '@/lib/fetch-wrapper';


type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];


interface IProps {
    access_token?: string,
    units: IUnit[],
    positions: IUnit[],
    roles: IUnit[],
    isModalOpen: boolean,
    setIsModalOpen: (value: boolean) => void,
    status: string,
    setStatus: (value: string) => void,
    //update
    dataUpdate: null | IUser,
    setDataUpdate: (value: null | IUser) => void
}


const UserModal = (props: IProps) => {
    const { setIsModalOpen, isModalOpen, setStatus, status, access_token, units, positions, roles, setDataUpdate, dataUpdate } = props
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
                email: dataUpdate.email,
                unit: dataUpdate.unit,
                position: dataUpdate.position,
                p12: dataUpdate.p12,
                role: dataUpdate.role,
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
        setFileList([])
        setDataUpdate(null)
        setIsModalOpen(false);
    };

    const onFinish = async (values: IUser) => {
        const { name, email, role, unit, position } = values
        let linkP12 = ''
        if (fileList.length == 0) {
            linkP12 = ''
        } else {
            linkP12 = await handleUpload() ?? ''
        }
        const data = { name, email, p12: linkP12, role, unit, position }
        const response = await handleCreateOrUpdateUser(data, access_token ?? '', status, dataUpdate)
        if (response.data) {
            messageApi.open({
                type: 'success',
                content: 'Tạo mới thành công',
            });
            handleCancel()
        } else {
            messageApi.open({
                type: 'error',
                content: 'Lỗi xảy ra'
            })
        }
    }

    const validateMessages = {
        required: '${label} không được để trống',
        types: { email: '${label} không hợp lệ' },
        pattern: { mismatch: '${label} phải thuộc tên miền vlute.edu.vn' }
    }

    const onChange = (value: string) => {
        console.log(`selected ${value}`);
    };

    const onSearch = (value: string) => {
        console.log('search:', value);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append('file', file as FileType);
        });
        // You can use any AJAX library you like
        const res = await handleUploadFileP12(formData)
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
            const isP12 = file.type === 'application/x-pkcs12';
            if (!isP12) {
                messageApi.open({
                    type: 'error',
                    content: `${file.name} không phải file p12`,
                });
            }
            setFileList([...fileList, file]);
            return isP12 || Upload.LIST_IGNORE;
        },
        fileList,
    };

    const handleDownload = (url: string) => {
        if (url == '') return;
        const link = document.createElement("a")
        link.href = url
        link.download = "certificate.p12" // tên file khi tải về
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }


    return (
        <>
            {contextHolder}
            <Modal
                title={status === "CREATE" ? "Thêm Tài khoản" : "Cập nhật Tài khoản"}
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
                        label="Tên Tài khoản"
                        name="name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        style={{ marginBottom: 8 }}
                        label="Email"
                        name="email"
                        rules={[{ required: true, pattern: /^[A-Za-z0-9]+@vlute\.edu\.vn$/ }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label={'Chức vụ'} name={'position'} rules={[{ required: true }]}>
                        <Select
                            style={{ minWidth: 250 }}
                            showSearch
                            placeholder="Vui lòng chọn chức vụ"
                            optionFilterProp="label"
                            onChange={onChange}
                            onSearch={onSearch}
                            options={positions.length > 0 ? positions.map(({ _id, name }) => ({
                                value: _id,
                                label: name
                            })) : []
                            }
                        />
                    </Form.Item>

                    <Form.Item label={'Đơn vị'} name={'unit'} rules={[{ required: true }]}>
                        <Select
                            style={{ minWidth: 250 }}
                            showSearch
                            placeholder="Vui lòng chọn đơn vị"
                            optionFilterProp="label"
                            onChange={onChange}
                            onSearch={onSearch}
                            options={units.length > 0 ? units.map(({ _id, name }) => ({
                                value: _id,
                                label: name
                            })) : []
                            }
                        />
                    </Form.Item>
                    <Form.Item label={'Quyền hạn'} name={'role'} rules={[{ required: true }]}>
                        <Select
                            style={{ minWidth: 250 }}
                            showSearch
                            placeholder="Vui lòng chọn quyền hạn"
                            optionFilterProp="label"
                            onChange={onChange}
                            onSearch={onSearch}
                            options={roles.length > 0 ? roles.map(({ _id, name }) => ({
                                value: _id,
                                label: name
                            })) : []
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        style={{ marginBottom: 8 }}
                        label="Tải file p12"
                        name="p12">
                        <div style={{ display: 'flex', gap: 4 }}>
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Chọn tập tin</Button>
                            </Upload>
                            <Button icon={<DownloadOutlined />} disabled={!dataUpdate?.p12} onClick={() => handleDownload(dataUpdate?.p12 ?? '')}>
                                Tải xuống p12
                            </Button>
                        </div>
                    </Form.Item>



                </Form>
            </Modal>
        </>
    );
};

export default UserModal;