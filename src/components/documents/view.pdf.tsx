// Only render the SDK on the client side.
"use client";

import { Button, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";

export default function ViewPdf() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (open && containerRef.current && window.NutrientViewer) {
            window.NutrientViewer.load({
                container: containerRef.current,
                document: "https://www.nutrient.io/downloads/nutrient-web-demo.pdf",

            });
        } else if (!open && containerRef.current && window.NutrientViewer) {
            window.NutrientViewer.unload(containerRef.current);
        }
    };

    // You must set the container height and width.
    return (
        <>
            <Button onClick={showModal}>Mở tài liệu mẫu</Button>
            <Modal
                title="Basic Modal"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                afterOpenChange={handleOpenChange}
                width={{
                    xs: '90%',
                }}
            >
                <p>Some contents...</p>
                <div
                    ref={containerRef}
                    style={{
                        height: "100vh",
                        width: "100%",
                    }}
                />
            </Modal>

        </>
    );
}