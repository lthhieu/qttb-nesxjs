"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, Button, Upload, Input, message, Space, Spin, Switch, Empty } from "antd";
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { UploadOutlined, LoadingOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { sendRequest, sendRequestFile } from "@/lib/fetch-wrapper";
import { authClient } from "@/lib/auth-client";

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    dataUpdate?: null | IDocument;
    setDataUpdate: (v: any) => void;
    access_token?: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

type SelectionPixel = {
    page: number;
    x: number; y: number; width: number; height: number;
};

export default function SignModal(props: IProps) {
    const { isModalOpen, setIsModalOpen, dataUpdate, setDataUpdate, access_token } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [password, setPassword] = useState('')

    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewerInstanceRef = useRef<any>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const dragRef = useRef<{ isDrawing: boolean; startX: number; startY: number }>({
        isDrawing: false, startX: 0, startY: 0
    });

    const [selection, setSelection] = useState<SelectionPixel | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageCount, setPageCount] = useState<number>(1);
    const [isSigning, setIsSigning] = useState(false);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [isDrawMode, setIsDrawMode] = useState(false);

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession()

    const handleSign = async () => {
        let data: any = {}
        if (password == '') { alert('Nhập mật khẩu'); return; }
        data['password'] = password

        // 1. Tạo đối tượng URL
        const document_url = new URL(dataUpdate?.cur_link ?? '');
        // 2. Lấy searchParams
        const document_filename = document_url.searchParams.get("name");
        data['document_filename'] = document_filename

        // 1. Tạo đối tượng URL
        //@ts-ignore
        const p12_url = new URL(session?.user?.p12 ?? '');
        // 2. Lấy searchParams
        const p12_filename = p12_url.searchParams.get("name");
        data['p12_filename'] = p12_filename

        if (!selection) { alert('Chọn vùng ký'); return; }
        const pdfCoords = await convertSelectionToPdfCoords(selection);
        console.log(pdfCoords)
        data['SIGN_X'] = JSON.stringify(pdfCoords.x) ?? '100'
        data['SIGN_Y'] = JSON.stringify(pdfCoords.y) ?? '100'
        data['SIGN_WIDTH'] = JSON.stringify(pdfCoords.width) ?? '250'
        data['SIGN_HEIGHT'] = JSON.stringify(pdfCoords.height) ?? '80'
        data['page'] = JSON.stringify(0) ?? '1'

        setUploading(true);
        // You can use any AJAX library you like
        const res = await sendRequest<IBackendResponse<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/sign/documents`,
            method: 'post',
            body: data,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
        if (res.data) {
            setFileList([]);
            setSelection(null)
            setPassword('')
            setIsDrawMode(false);

            messageApi.open({
                type: 'success',
                content: `Upload successfully`,
            });
            setUploading(false);
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
                    content: `${file.name} không phải tài liệu P12`,
                });
                return false;
            }
            setFileList([...fileList, file]);
            return isP12 || Upload.LIST_IGNORE;
        },
        fileList,
    };

    // --- LOGIC KÉO THẢ (Giữ nguyên, chỉ thêm check isDrawMode) ---
    useEffect(() => {
        const overlay = overlayRef.current;
        const container = containerRef.current;
        if (!overlay || !container) return;

        const getCoords = (e: PointerEvent | MouseEvent) => {
            const rect = container.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top, w: rect.width, h: rect.height };
        };

        const onPointerDown = (e: PointerEvent) => {
            if (!isDrawMode || e.button !== 0) return;
            e.preventDefault();
            overlay.setPointerCapture?.(e.pointerId);
            const { x, y } = getCoords(e);
            dragRef.current = { isDrawing: true, startX: x, startY: y };
            setSelection({ page: currentPage, x, y, width: 0, height: 0 });
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDrawMode || !dragRef.current.isDrawing) return;
            e.preventDefault();
            const { x: currX, y: currY, w: maxW, h: maxH } = getCoords(e);
            const { startX, startY } = dragRef.current;
            const clampX = Math.max(0, Math.min(currX, maxW));
            const clampY = Math.max(0, Math.min(currY, maxH));
            const x = Math.min(startX, clampX);
            const y = Math.min(startY, clampY);
            const width = Math.abs(clampX - startX);
            const height = Math.abs(clampY - startY);
            setSelection({ page: currentPage, x, y, width, height });
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!isDrawMode || !dragRef.current.isDrawing) return;
            dragRef.current.isDrawing = false;
            try { overlay.releasePointerCapture?.(e.pointerId); } catch { }
            setSelection(prev => (prev && (prev.width < 5 || prev.height < 5)) ? null : prev);
        };

        overlay.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        return () => {
            overlay.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [currentPage, isDrawMode]);

    // --- SUBMIT ---
    async function convertSelectionToPdfCoords(sel: SelectionPixel) {
        if (!containerRef.current) throw new Error("No container");
        const viewer = viewerInstanceRef.current;
        const containerRect = containerRef.current.getBoundingClientRect();
        let pagePdfWidth = 595, pagePdfHeight = 842;

        try {
            let ps = null;
            if (typeof viewer?.getPageSize === "function") ps = viewer.getPageSize(sel.page - 1);
            else if (viewer?.documentInfo?.pageSizes) ps = viewer.documentInfo.pageSizes[sel.page - 1];
            if (ps) { pagePdfWidth = ps.width; pagePdfHeight = ps.height; }
        } catch (e) { }

        const scaleX = pagePdfWidth / containerRect.width;
        const scaleY = pagePdfHeight / containerRect.height;

        return {
            page: sel.page,
            x: Number((sel.x * scaleX).toFixed(2)),
            y: Number((sel.y * scaleY).toFixed(2)),
            width: Number((sel.width * scaleX).toFixed(2)),
            height: Number((sel.height * scaleY).toFixed(2)),
        };
    }

    const handleOpenChange = (open: boolean) => {
        if (open && containerRef.current && window.NutrientViewer) {
            window.NutrientViewer.load({
                container: containerRef.current,
                document: dataUpdate?.cur_link ?? '',

            });
        } else if (!open && containerRef.current && window.NutrientViewer) {
            window.NutrientViewer.unload(containerRef.current);
        }
    };

    return (<>
        {contextHolder}
        <Modal
            title={`Ký số: ${dataUpdate?.name || "Tài liệu"}`}
            open={isModalOpen}
            onCancel={() => { setIsModalOpen(false); setDataUpdate(null) }}
            footer={null}
            width="95%"
            style={{ top: 20 }}
            afterOpenChange={handleOpenChange}
            destroyOnHidden={true}
        >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">

                {/* TOOLBAR */}
                <div style={{ background: "#f5f5f5", padding: "12px", borderRadius: 8, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                    <div style={{ borderRight: '1px solid #ddd', paddingRight: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 500 }}>Chế độ:</span>
                        <Switch
                            checkedChildren={<><EditOutlined /> Vẽ vùng ký</>}
                            unCheckedChildren={<><EyeOutlined /> Xem / Cuộn</>}
                            checked={isDrawMode}
                            onChange={(c) => {
                                setIsDrawMode(c);
                            }}
                        />
                    </div>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Tải file p12</Button>
                    </Upload>
                    <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" style={{ width: 200 }} />
                    <Button
                        type="primary"
                        onClick={handleSign}
                        disabled={fileList.length === 0}
                        loading={uploading}
                    >
                        {uploading ? 'Đang tải' : 'Bắt đầu ký'}
                    </Button>
                    {selection && <Button danger size="small" onClick={() => setSelection(null)}>Xóa chọn</Button>}
                </div>

                {/* VIEWER */}
                <div style={{ display: "flex", gap: 16, height: "70vh" }}>
                    <div style={{
                        flex: 1,
                        position: "relative",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        overflow: "hidden",
                        background: "#f0f0f0" // Màu nền xám nhẹ thay vì trắng tinh
                    }}>

                        {/* CHECK DỮ LIỆU TRƯỚC */}
                        {!dataUpdate?.cur_link ? (
                            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#999' }}>
                                <Empty description="Không có tài liệu nào được chọn" />
                            </div>
                        ) : (
                            <>
                                {isLoadingPdf && (
                                    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Spin indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />} tip="Đang tải thư viện..." />
                                    </div>
                                )}

                                <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

                                <div
                                    ref={overlayRef}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        zIndex: 20,
                                        backgroundColor: "transparent",
                                        pointerEvents: isDrawMode ? "all" : "none",
                                        cursor: isDrawMode ? "crosshair" : "default",
                                        touchAction: "none",
                                        userSelect: "none"
                                    }}
                                />
                                {/* <PDFJSViewer /> */}

                                {selection && (
                                    <div style={{
                                        position: "absolute",
                                        left: selection.x, top: selection.y,
                                        width: selection.width, height: selection.height,
                                        border: "2px solid #1890ff",
                                        backgroundColor: "rgba(24, 144, 255, 0.2)",
                                        zIndex: 30,
                                        pointerEvents: "none"
                                    }}>
                                        <span style={{ position: "absolute", top: -22, background: "#1890ff", color: "#fff", fontSize: 10, padding: "2px" }}>Vùng ký</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div style={{ width: 200, background: "#fafafa", padding: 10, fontSize: 12 }}>
                        <p><strong>Trạng thái:</strong> {isDrawMode ? <span style={{ color: 'red' }}>Đang vẽ</span> : <span style={{ color: 'green' }}>Đang xem</span>}</p>
                        <p><strong>Trang:</strong> {currentPage}</p>
                    </div>
                </div>
            </Space>
        </Modal>
    </>
    );
}