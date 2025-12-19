"use client"
import { Modal, Form, Input, message } from 'antd';
import { useEffect } from 'react';
import { handleCreateOrUpdateUnit } from '@/app/(main)/units/actions';

interface IProps {
    access_token?: string,
    isModalOpen: boolean,
    setIsModalOpen: (value: boolean) => void,
    status: string,
    setStatus: (value: string) => void,
    //update
    dataUpdate: null | IUnit,
    setDataUpdate: (value: null | IUnit) => void
}


const UnitModal = (props: IProps) => {
    const { setIsModalOpen, isModalOpen, setStatus, status, access_token, setDataUpdate, dataUpdate } = props
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
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

    const onFinish = async (values: IUnit) => {
        const { name } = values
        const data = { name }
        const response = await handleCreateOrUpdateUnit(data, access_token ?? '', status, dataUpdate)
        if (response.data) {
            messageApi.open({
                type: 'success',
                content: response.message,
            });
            handleCancel()
        } else {
            messageApi.open({
                type: 'error',
                content: 'Lỗi xảy ra',
            });
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

    return (
        <>
            {contextHolder}
            <Modal
                title={status === "CREATE" ? "Thêm Đơn vị" : "Cập nhật Đơn vị"}
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
                    name="unit-modal"
                    onFinish={onFinish}
                    validateMessages={validateMessages}
                >
                    <Form.Item
                        style={{ marginBottom: 8 }}
                        label="Tên Đơn vị"
                        name="name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                </Form>
            </Modal>
        </>
    );
};

export default UnitModal;