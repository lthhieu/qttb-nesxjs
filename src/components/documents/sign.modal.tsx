// components/SignModal.tsx - PHIÊN BẢN HOÀN CHỈNH CUỐI CÙNG
"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, Button, message, Space, Spin, Input } from "antd";
import { CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { sendRequest } from "@/lib/fetch-wrapper";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/webpack";
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation'

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.js`;

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    dataUpdate?: IDocument | null;
    setDataUpdate: (v: any) => void;
    access_token?: string;
}

type Selection = {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
};

export default function SignModal(props: IProps) {
    const { isModalOpen, setIsModalOpen, dataUpdate, setDataUpdate, access_token } = props;

    const [messageApi, contextHolder] = message.useMessage();
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [signing, setSigning] = useState(false);
    const router = useRouter()

    //modal từ chối ký
    const [rejectModal, setRejectModal] = useState({ visible: false, id: '', reason: '' });

    // Modal nhập mật khẩu
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [password, setPassword] = useState("");

    // PDF.js
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<any>(null);

    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale] = useState(1.5);

    const [selection, setSelection] = useState<Selection | null>(null);
    const [preview, setPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);


    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession()

    // console.log(dataUpdate)

    // Load PDF
    useEffect(() => {
        if (!isModalOpen || !dataUpdate?.cur_link) return;

        const load = async () => {
            setLoadingPdf(true);
            try {
                const pdf = await getDocument(dataUpdate.cur_link).promise;
                pdfRef.current = pdf;
                setNumPages(pdf.numPages);
                renderPage(1);
                setPageNumber(1);
                setSelection(null);
            } catch (err) {
                messageApi.error("Không thể tải tài liệu");
            }
        };
        load();
    }, [isModalOpen, dataUpdate?.cur_link]);

    const renderPage = async (num: number) => {
        if (!canvasRef.current || !pdfRef.current) return;
        setLoadingPdf(true);

        const page = await pdfRef.current.getPage(num);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setLoadingPdf(false);

        if (overlayRef.current) {
            overlayRef.current.style.width = `${viewport.width}px`;
            overlayRef.current.style.height = `${viewport.height}px`;
        }
    };

    useEffect(() => {
        if (pdfRef.current && pageNumber) renderPage(pageNumber);
    }, [pageNumber]);

    // Kéo thả vùng ký
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = overlayRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPreview({ x, y, w: 0, h: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!preview) return;
        const rect = overlayRef.current!.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;

        const x = Math.min(preview.x, curX);
        const y = Math.min(preview.y, curY);
        const w = Math.abs(curX - preview.x);
        const h = Math.max(70, Math.abs(curY - preview.y));

        setPreview({ x, y, w, h });
    };

    const handleMouseUp = () => {
        if (!preview) return;
        if (preview.w < 50 || preview.h < 50) {
            setPreview(null);
            return;
        }

        setSelection({
            page: pageNumber,
            x: preview.x,
            y: preview.y,
            width: preview.w,
            height: preview.h,
        });
        messageApi.success("Đã chọn vị trí ký!");
        setPreview(null);
    };

    // Lấy tọa độ chuẩn PDF (pt)
    const getPdfCoords = async () => {
        if (!selection || !pdfRef.current) return null;
        const page = await pdfRef.current.getPage(selection.page);
        const viewport = page.getViewport({ scale });

        const pdfWidth = viewport.width / scale;
        const pdfHeight = viewport.height / scale;

        return {
            x: Number((selection.x / scale).toFixed(1)),
            y: Number((pdfHeight - (selection.y + selection.height) / scale).toFixed(1)), // đảo Y
            width: Number((selection.width / scale).toFixed(1)),
            height: Number((selection.height / scale).toFixed(1)),
            page: selection.page - 1,
        };
    };

    // Khi bấm "Ký số ngay" → mở modal nhập mật khẩu
    const handleOpenPasswordModal = () => {
        if (!selection) {
            messageApi.warning("Vui lòng kéo thả để chọn vị trí ký trước!");
            return;
        }
        setPassword("");
        setPasswordModalOpen(true);
    };

    // Xác nhận ký với mật khẩu
    const handleConfirmSign = async () => {
        if (!password) {
            messageApi.error("Vui lòng nhập mật khẩu chữ ký số");
            return;
        }

        setSigning(true);
        setPasswordModalOpen(false);

        try {
            const coords = await getPdfCoords();
            const document_url = new URL(dataUpdate?.cur_link ?? '');
            //@ts-ignore
            const p12_url = new URL(session?.user?.p12 ?? '');
            const p12_filename = p12_url.searchParams.get("name");
            const document_filename = document_url.searchParams.get("name");
            // console.log(dataUpdate)

            const res = await sendRequest<IBackendResponse<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/documents/sign-update-info/${dataUpdate?._id}`,
                method: "PATCH",
                body: {
                    // Thông tin ký số
                    password,
                    p12_filename,
                    document_filename,
                    SIGN_X: Math.round(coords?.x ?? 100),
                    SIGN_Y: Math.round(coords?.y ?? 100),
                    SIGN_WIDTH: Math.round(coords?.width ?? 250),
                    SIGN_HEIGHT: Math.round(coords?.height ?? 80),
                    page: coords?.page ?? 0,

                    // Thông tin cập nhật workflow (backend vẫn dùng để lấy cur_link nếu cần)
                    cur_link: dataUpdate?.cur_link,
                    cur_version: dataUpdate?.cur_version,
                },
                headers: { Authorization: `Bearer ${access_token}` },
            });

            if (res.data) {
                messageApi.success("Ký số thành công! Quy trình đã được cập nhật.");
                setIsModalOpen(false);
                router.refresh(); // reload lại danh sách để thấy tài liệu biến mất khỏi "cần ký"
            } else {
                messageApi.error(res.message || "Ký số thất bại");
            }
        } catch (err: any) {
            messageApi.error(err?.message || "Ký số thất bại");
        } finally {
            setSigning(false);
        }
    };



    const handleReject = async () => {

        const res = await sendRequest<IBackendResponse<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/documents/reject/${rejectModal.id}`,
            method: "PATCH",
            body: { reason: rejectModal.reason },
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (res.data) {
            messageApi.success('Từ chối thành công');
            setSigning(true);
            setRejectModal({ visible: false, id: '', reason: '' });
            router.refresh();
        } else {
            messageApi.error(res.message)
        }

        // await sendRequest({
        //   url: `/documents/reject/${rejectModal.id}`,
        //   method: 'PATCH',
        //   body: { reason: rejectModal.reason },
        // });
        // message.success('Từ chối thành công');
        // setRejectModal({ visible: false, id: null, reason: '' });
        // // refresh data
    };

    return (
        <>
            {contextHolder}

            {/* Modal chính - xem PDF & chọn vị trí */}
            <Modal
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setDataUpdate(null) }}
                footer={null}
                width="96%"
                style={{ top: 20 }}
                title={<div style={{ fontSize: 22, fontWeight: "bold", textAlign: "center" }}>
                    Ký số tài liệu: {dataUpdate?.name}
                </div>}
            >
                {/* Thanh điều khiển trên cùng */}
                <div style={{ textAlign: "center", marginBottom: 20, position: 'sticky', top: 0, zIndex: 9999, borderRadius: '10px', background: '#e0e9efff', padding: '8px 0px' }}>
                    <Space size={20} align="center">
                        <Button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1}>
                            Trang trước
                        </Button>
                        <span style={{ fontSize: 20, fontWeight: "bold", minWidth: 120 }}>
                            Trang {pageNumber} / {numPages || "..."}
                        </span>
                        <Button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber === numPages}>
                            Trang sau
                        </Button>

                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                setSelection(null);
                                messageApi.info("Đã xóa vị trí ký");
                            }}
                            disabled={!selection}
                        >
                            Xóa vị trí
                        </Button>

                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => setRejectModal({ visible: true, id: dataUpdate?._id ?? 'null', reason: '' })}
                        >
                            Từ chối ký
                        </Button>

                        <Button
                            type="primary"
                            size="large"
                            loading={signing}
                            onClick={handleOpenPasswordModal}
                            disabled={!selection}
                            style={{ minWidth: 180, height: 44, fontSize: 16, fontWeight: "bold" }}
                        >
                            {signing ? "Đang ký..." : "Ký số ngay"}
                        </Button>
                    </Space>
                </div>

                {/* PDF Viewer */}
                <div style={{ position: "relative", display: "inline-block", border: "3px solid #ddd", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
                    {loadingPdf && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.95)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Spin size="large" tip="Đang tải tài liệu..." />
                        </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: "block" }} />

                    <div
                        ref={overlayRef}
                        style={{ position: "absolute", top: 0, left: 0, cursor: "crosshair" }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => setPreview(null)}
                    >
                        {/* Preview khi kéo */}
                        {preview && (
                            <div style={{
                                position: "absolute",
                                left: preview.x, top: preview.y,
                                width: preview.w, height: preview.h,
                                border: "4px solid #ff4d4f",
                                background: "rgba(255,77,79,0.3)",
                                borderRadius: 12,
                                pointerEvents: "none",
                                boxShadow: "0 0 20px rgba(255,77,79,0.6)",
                            }}>
                                <div style={{ color: "#ff4d4f", padding: "8px 16px", borderRadius: "8px 8px 0 0", fontWeight: "bold" }}>
                                    VỊ TRÍ CHỮ KÝ
                                </div>
                            </div>
                        )}

                        {/* Vùng đã chọn */}
                        {selection && selection.page === pageNumber && (
                            <div style={{
                                position: "absolute",
                                left: selection.x, top: selection.y,
                                width: selection.width, height: selection.height,
                                border: "4px dashed #52c41a",
                                background: "rgba(82,196,26,0.2)",
                                borderRadius: 12,
                                pointerEvents: "none",
                            }}>
                                <div style={{ color: "#52c41a", padding: "8px 16px", borderRadius: "12px 12px 0 0", fontWeight: "bold" }}>
                                    ĐÃ CHỌN VỊ TRÍ KÝ
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: 24, fontSize: 16, color: "#d48806" }}>
                    Kéo thả chuột trên tài liệu để chọn vị trí ký • Kéo lại để thay đổi
                </div>

                <div>Danh sách đã ký</div>
                {dataUpdate?.info && dataUpdate.info.length > 0 ? (
                    dataUpdate.info.map((item, infoIndex) => (
                        <div key={infoIndex}>
                            <p>--- Thông tin ký số phiên bản {infoIndex} ---</p>

                            {item.signers && item.signers.length > 0 ? (
                                item.signers.map((s, signerIndex) => (
                                    <p key={signerIndex}>
                                        {s.user.name} {s.position?.name} {s.unit?.name}
                                    </p>
                                ))
                            ) : (
                                <p>Không có signer</p>
                            )}
                        </div>
                    ))
                ) : (
                    <>Chưa có ai ký</>
                )}

            </Modal>

            {/* Modal nhập mật khẩu khi ký */}
            <Modal
                title={<span style={{ fontSize: 18, fontWeight: "bold" }}>Nhập mật khẩu chữ ký số</span>}
                open={passwordModalOpen}
                onCancel={() => setPasswordModalOpen(false)}
                onOk={handleConfirmSign}
                okText="Ký số"
                cancelText="Hủy"
                okButtonProps={{ loading: signing, size: "large", type: "primary" }}
                cancelButtonProps={{ size: "large" }}
                centered
                width={400}
                zIndex={9998}
            >
                <Input.Password
                    placeholder="Nhập mật khẩu USB Token / File P12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onPressEnter={handleConfirmSign}
                    size="large"
                    autoFocus
                />
            </Modal>

            <Modal
                title={<span style={{ fontSize: 18, fontWeight: "bold" }}>Từ chối ký tài liệu</span>}
                open={rejectModal.visible}
                onOk={handleReject}
                onCancel={() => setRejectModal({ visible: false, id: 'null', reason: '' })}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ size: "large", type: "primary" }}
                cancelButtonProps={{ size: "large" }}
                centered
                width={400}
                zIndex={9998}
            >
                <Input
                    placeholder="Nhập lý do từ chối"
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    onPressEnter={handleReject}
                    size="large"
                    autoFocus
                />
            </Modal>
        </>
    );
}