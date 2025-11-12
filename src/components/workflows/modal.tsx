import { Modal, Form, Input, InputNumber, message, Card, Space, Button, Typography, Select } from 'antd';
import { sendRequest } from '@/lib/fetch-wrapper';
import { useRouter } from 'next/navigation'
import { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';

interface IProps {
    access_token?: string,
    units: IUnit[],
    positions: IUnit[],
    isModalOpen: boolean,
    setIsModalOpen: (value: boolean) => void,
    status: string,
    setStatus: (value: string) => void,
    //update
    dataUpdate: null | IWorkflow,
    setDataUpdate: (value: null | IWorkflow) => void
}


const WorkflowModal = (props: IProps) => {
    const { setIsModalOpen, isModalOpen, setStatus, status, access_token, units, positions, setDataUpdate, dataUpdate } = props
    const [form] = Form.useForm()
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
                version: dataUpdate.version,
                steps: dataUpdate.steps,
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

    const onFinish = async (values: IWorkflow) => {
        const { name, version, steps } = values
        const stepsWithOrder = steps != undefined && steps.length > 0 ? steps.map((s, i) => ({ ...s, order: i })) : [];
        const response = await sendRequest<IBackendResponse<IWorkflow>>({
            url: status === "CREATE" ? `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows` : `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows/${dataUpdate?._id}`,
            method: status === "CREATE" ? "POST" : "PATCH",
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            body: { name, version, steps: stepsWithOrder }
        })
        if (response.data) {
            messageApi.open({
                type: 'success',
                content: response.message,
            });
            router.refresh()
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
        types: {
            number: '${label} phải là số',
        },
        number: {
            range: '${label} có giá trị từ ${min} tới ${max}',
        },
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
                title={status === "CREATE" ? "Thêm Quy trình" : "Cập nhật Quy trình"}
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
                        label="Tên Quy trình"
                        name="name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        style={{ marginBottom: 8 }}
                        label="Phiên bản"
                        name="version"
                        rules={[{ required: true, type: 'number', min: 0, max: 99 }]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Typography style={{ marginBottom: 12 }}>Các bước xử lý</Typography>
                    <Form.List name="steps">
                        {(fields, { add, remove }) => (
                            <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                                {fields.map((field) => (
                                    <Card
                                        size="small"
                                        title={`Bước ${field.name + 1}`}
                                        key={field.key}
                                        extra={
                                            <CloseOutlined
                                                onClick={() => {
                                                    remove(field.name);
                                                }}
                                            />
                                        }
                                    >

                                        {/* Nest Form.List */}
                                        <Form.Item label="Người ký">
                                            <Form.List name={[field.name, 'signers']}>
                                                {(subFields, subOpt) => (
                                                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
                                                        {subFields.map((subField) => (
                                                            <Space key={subField.key}>
                                                                <Form.Item noStyle name={[subField.name, 'position']}>
                                                                    <Select
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
                                                                <Form.Item noStyle name={[subField.name, 'unit']}>
                                                                    <Select
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
                                                                <CloseOutlined
                                                                    onClick={() => {
                                                                        subOpt.remove(subField.name);
                                                                    }}
                                                                />
                                                            </Space>
                                                        ))}
                                                        <Button type="dashed" onClick={() => subOpt.add()} block>
                                                            + Thêm người ký
                                                        </Button>
                                                    </div>
                                                )}
                                            </Form.List>
                                        </Form.Item>
                                    </Card>
                                ))}

                                <Button type="dashed" onClick={() => add()} block>
                                    + Thêm bước xử lý
                                </Button>
                            </div>
                        )}
                    </Form.List>
                    <Form.Item noStyle shouldUpdate>
                        {() => (
                            <Typography>
                                <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
                            </Typography>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default WorkflowModal;