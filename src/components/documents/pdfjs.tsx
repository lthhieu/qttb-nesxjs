// 'use client'

// import React, { useState, useRef, useEffect } from 'react';
// import * as pdfjsLib from "pdfjs-dist/webpack";

// pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
// const PDFJSViewer = () => {
//     const [pdfDoc, setPdfDoc] = useState(null);
//     const [pageNum, setPageNum] = useState(1);
//     const [totalPages, setTotalPages] = useState(0);
//     const [scale, setScale] = useState(1.0);
//     const [rotation, setRotation] = useState(0);
//     const canvasRef = useRef(null);
//     const fileInputRef = useRef(null);

//     const renderPage = async (pageNumber) => {
//         if (!pdfDoc) return;

//         const page = await pdfDoc.getPage(pageNumber);
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d');

//         // Apply rotation
//         const viewport = page.getViewport({ scale, rotation: rotation });

//         // Set canvas dimensions to match the viewport
//         canvas.height = viewport.height;
//         canvas.width = viewport.width;

//         // Render the PDF page
//         const renderContext = {
//             canvasContext: context,
//             viewport: viewport
//         };

//         await page.render(renderContext).promise;
//     };

//     // Handle file selection
//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         if (!file || file.type !== 'application/pdf') {
//             alert('Please select a valid PDF file');
//             return;
//         }

//         const reader = new FileReader();
//         reader.onload = async (e) => {
//             const typedArray = new Uint8Array(e.target.result);
//             try {
//                 const loadingTask = pdfjsLib.getDocument(typedArray);
//                 const pdf = await loadingTask.promise;

//                 setPdfDoc(pdf);
//                 setTotalPages(pdf.numPages);
//                 setPageNum(1);
//             } catch (error) {
//                 console.error('Error loading PDF:', error);
//                 alert('Error loading PDF file');
//             }
//         };
//         reader.readAsArrayBuffer(file);
//     };

//     // Navigation functions
//     const goToPrevPage = () => {
//         if (pageNum > 1) {
//             setPageNum(prevPageNum => prevPageNum - 1);
//         }
//     };

//     const goToNextPage = () => {
//         if (pageNum < totalPages) {
//             setPageNum(prevPageNum => prevPageNum + 1);
//         }
//     };

//     // Zoom functions
//     const zoomIn = () => {
//         setScale(prevScale => Math.min(prevScale + 0.2, 3));
//     };

//     const zoomOut = () => {
//         setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
//     };

//     // Rotation functions
//     const rotateClockwise = () => {
//         setRotation(prevRotation => (prevRotation + 90) % 360);
//     };

//     const rotateCounterClockwise = () => {
//         setRotation(prevRotation => (prevRotation - 90 + 360) % 360);
//     };

//     // Re-render when page number, scale or rotation changes
//     useEffect(() => {
//         if (pdfDoc) {
//             renderPage(pageNum);
//         }
//     }, [pdfDoc, pageNum, scale, rotation]);

//     return (
//         <div className="pdf-viewer">
//             <div className="pdf-header">
//                 <h2>PDF Viewer</h2>
//                 <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     accept="application/pdf"
//                     className="file-input"
//                 />
//             </div>

//             {pdfDoc && (
//                 <div className="controls-container">
//                     <div className="page-controls">
//                         <button onClick={goToPrevPage} disabled={pageNum <= 1}>
//                             Previous
//                         </button>
//                         <span>
//                             Page {pageNum} of {totalPages}
//                         </span>
//                         <button onClick={goToNextPage} disabled={pageNum >= totalPages}>
//                             Next
//                         </button>
//                     </div>

//                     <div className="zoom-controls">
//                         <button onClick={zoomOut}>Zoom Out</button>
//                         <span>{Math.round(scale * 100)}%</span>
//                         <button onClick={zoomIn}>Zoom In</button>
//                     </div>

//                     <div className="rotation-controls">
//                         <button onClick={rotateCounterClockwise}>Rotate Left</button>
//                         <button onClick={rotateClockwise}>Rotate Right</button>
//                     </div>
//                 </div>
//             )}

//             <div className="pdf-container">
//                 {pdfDoc ? (
//                     <canvas ref={canvasRef} />
//                 ) : (
//                     <div className="placeholder">Select a PDF file to view</div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PDFJSViewer;