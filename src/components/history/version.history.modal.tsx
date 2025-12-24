import { Button, Modal, List, Tag, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

const VersionHistoryButton = ({ record }: { record: IDocument }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Duyệt info để lấy lịch sử version
    const versions: Version[] = record.info || [];

    console.log(versions)

    return (
        <>
            <Button
                type="default"
                icon={<InfoCircleOutlined />}
                onClick={() => setIsModalOpen(true)}
            >
            </Button>

            <Modal
                title="Lịch sử version văn bản"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
            >
                {versions.length === 0 ? (
                    <p>Chưa có lịch sử ký</p>
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={versions}
                        renderItem={(versionItem) => {
                            const isRejected = !!versionItem.error;
                            const signers = versionItem.signers || [];
                            const lastSigner = signers[signers.length - 1]; // Người cuối cùng (người reject nếu có)
                            const rejectorName = lastSigner?.user?.name || 'Không xác định';

                            return (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <span>Version {versionItem.version}</span>
                                            </Space>
                                        }
                                        description={
                                            <div>
                                                <strong>Link PDF:</strong> <a href={versionItem.link} target="_blank" rel="noopener noreferrer">Tải version {versionItem.version}</a>
                                                <br />
                                                {isRejected && (
                                                    <>
                                                        <strong>Lý do từ chối:</strong> {versionItem.error}
                                                        <br />
                                                        <strong>Người từ chối:</strong> {rejectorName}
                                                    </>
                                                )}
                                                <br />
                                                <strong>Danh sách người ký:</strong>
                                                {signers.length === 0 ? (
                                                    <span> Chưa có ai ký</span>
                                                ) : (
                                                    <List
                                                        size="small"
                                                        dataSource={signers}
                                                        renderItem={(signer) => (
                                                            <List.Item>
                                                                {signer.user?.name || 'N/A'} ({signer.position?.name || 'N/A'} {signer.unit?.name || 'N/A'})
                                                            </List.Item>
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Modal>
        </>
    );
};

export default VersionHistoryButton;