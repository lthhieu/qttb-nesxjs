// "use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Spin, message } from "antd";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.js`;

const PDF_URL = "https://www.nutrient.io/downloads/nutrient-web-demo.pdf";

interface SignArea {
    page: number;
    x: number;      // tỷ lệ PDF (0-1 hoặc pixel thực)
    y: number;
    width: number;
    height: number;
}

export default function SuperSmoothSignPDF() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.4);

    const [signArea, setSignArea] = useState<SignArea | null>(null);

    // Live preview khi kéo
    const [preview, setPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

    const pdfRef = useRef<any>(null);

    // Render PDF chỉ 1 lần
    const renderPage = async (num: number) => {
        if (!canvasRef.current || !pdfRef.current) return;
        setLoading(true);

        const page = await pdfRef.current.getPage(num);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setLoading(false);

        // Đồng bộ kích thước overlay
        if (overlayRef.current) {
            overlayRef.current.style.width = viewport.width + "px";
            overlayRef.current.style.height = viewport.height + "px";
        }
    };

    useEffect(() => {
        if (!isModalOpen) return;
        const load = async () => {
            const pdf = await getDocument(PDF_URL).promise;
            pdfRef.current = pdf;
            setNumPages(pdf.numPages);
            renderPage(pageNumber);
        };
        load();
    }, [isModalOpen]);

    useEffect(() => {
        if (pdfRef.current) renderPage(pageNumber);
    }, [pageNumber, scale]);

    // Mouse handlers – chỉ vẽ trên overlay
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = overlayRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPreview({ x, y, w: 0, h: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!preview || !overlayRef.current) return;

        const rect = overlayRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = Math.min(preview.x, currentX);
        const y = Math.min(preview.y, currentY);
        const w = Math.abs(currentX - preview.x);
        const h = Math.max(60, Math.abs(currentY - preview.y)); // min height

        setPreview({ x, y, w, h });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!preview) return;

        const rect = overlayRef.current!.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const w = Math.abs(endX - preview.x);
        const h = Math.max(60, Math.abs(endY - preview.y));

        if (w < 40 || h < 40) {
            setPreview(null);
            return;
        }

        // Lưu vùng ký (tính theo tỷ lệ thực của PDF)
        const finalX = Math.min(preview.x, endX);
        const finalY = Math.min(preview.y, endY);

        setSignArea({
            page: pageNumber,
            x: finalX / scale,
            y: finalY / scale,
            width: w / scale,
            height: h / scale,
        });

        message.success("Đã đặt vị trí ký!");
        setPreview(null); // xóa preview
    };

    return (
        <>
            <Button type="primary" size="large" onClick={() => setIsModalOpen(true)}>
                Mở PDF – Kéo thả mượt như DocuSign
            </Button>

            <Modal
                title={<>Ký điện tử – Trang {pageNumber}/{numPages}</>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold", color: signArea?.page === pageNumber ? "#52c41a" : "#999" }}>
                            {signArea?.page === pageNumber ? "Đã chọn vị trí ký" : "Chưa đặt vị trí ký"}
                        </span>
                        <Button
                            danger
                            onClick={() => {
                                setSignArea(null);
                                message.info("Đã xóa vị trí ký");
                            }}
                        >
                            Xóa vị trí
                        </Button>
                    </div>
                }
                width="96%"
                style={{ top: 20 }}
                destroyOnClose
            >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <Button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1}>Trước</Button>
                    <span style={{ margin: "0 24px", fontSize: 18, fontWeight: "bold" }}>
                        Trang {pageNumber} / {numPages}
                    </span>
                    <Button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber === numPages}>Sau</Button>

                    <span style={{ marginLeft: 40 }}>
                        <Button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}>−</Button>
                        <span style={{ margin: "0 12px", fontWeight: "bold" }}>{Math.round(scale * 100)}%</span>
                        <Button onClick={() => setScale(s => s + 0.2)}>+</Button>
                    </span>
                </div>

                {/* Container chính */}
                <div style={{ display: "inline-block", position: "relative", border: "2px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
                    {loading && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.9)", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Spin size="large" tip="Đang tải trang..." />
                        </div>
                    )}

                    {/* Layer 1: PDF */}
                    <canvas ref={canvasRef} style={{ display: "block" }} />

                    {/* Layer 2: Overlay kéo thả + vùng ký */}
                    <div
                        ref={overlayRef}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            cursor: "crosshair",
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => setPreview(null)}
                    >
                        {/* Preview live khi kéo */}
                        {preview && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: preview.x,
                                    top: preview.y,
                                    width: preview.w,
                                    height: preview.h,
                                    border: "3px solid #ff4d4f",
                                    background: "rgba(255, 77, 79, 0.2)",
                                    pointerEvents: "none",
                                    borderRadius: 6,
                                    boxShadow: "0 0 0 3px rgba(255,77,79,0.3)",
                                }}
                            >
                                <span style={{ position: "absolute", top: 8, left: 10, color: "#d4380d", fontWeight: "bold", fontSize: 14 }}>
                                    CHỖ KÝ
                                </span>
                            </div>
                        )}

                        {/* Vùng ký đã lưu */}
                        {signArea && signArea.page === pageNumber && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: signArea.x * scale,
                                    top: signArea.y * scale,
                                    width: signArea.width * scale,
                                    height: signArea.height * scale,
                                    border: "3px dashed #52c41a",
                                    background: "rgba(82, 196, 26, 0.15)",
                                    borderRadius: 8,
                                    pointerEvents: "none",
                                }}
                            >
                                <span style={{ position: "absolute", top: 10, left: 12, color: "#237804", fontWeight: "bold", fontSize: 16 }}>
                                    ĐÃ ĐẶT CHỖ KÝ
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: 16, padding: "12px", background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 8, color: "#d48806" }}>
                    <strong>Hướng dẫn:</strong> Kéo thả chuột để đặt vị trí ký. Kéo lại = thay vị trí mới ngay lập tức!
                </div>

                {/* Dữ liệu để gửi backend */}
                {signArea && (
                    <pre style={{ marginTop: 12, background: "#f6ffed", padding: 12, borderRadius: 6, fontSize: 13 }}>
                        {JSON.stringify({
                            page: signArea.page,
                            x: Math.round(signArea.x),
                            y: Math.round(signArea.y),
                            width: Math.round(signArea.width),
                            height: Math.round(signArea.height),
                        }, null, 2)}
                    </pre>
                )}
            </Modal>
        </>
    );
}