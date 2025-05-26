import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";
//import pdfjsWorker from "G:/Projekt/ducky pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs"; // Use .mjs instead of .js
import pdfjsWorkerURL from "pdfjs-dist/build/pdf.worker.min.mjs?url"; // Import worker using url suffix for Vite

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerURL; // Use the imported URL

interface PDFViewerProps {
  darkMode: boolean;
  zoomLevel: number;
  pdfFile?: File;
  activeTool?: string;
  penColor?: string;
  penSize?: number;
  highlighterColor?: string;
  eraserSize?: number;
  onPageChange?: (page: number) => void;
  onNumPages?: (num: number) => void;
  fullScreen?: boolean;
  currentPage?: number;
  notes?: { [page: number]: string };
  setNotes?: (notes: { [page: number]: string }) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  darkMode,
  zoomLevel,
  pdfFile,
  activeTool = "cursor",
  penColor = "#000000",
  penSize = 2,
  highlighterColor = "#FFEB3B",
  eraserSize = 20,
  onPageChange,
  onNumPages,
  fullScreen = false,
  currentPage,
  notes = {},
  setNotes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [annotations, setAnnotations] = useState<{ [page: number]: ImageData[] }>({});
  const [redoStack, setRedoStack] = useState<{ [page: number]: ImageData[] }>({});

  // Load PDF
  useEffect(() => {
    if (!pdfFile) return;
    let fileURL = URL.createObjectURL(pdfFile);
    const loadPDF = async () => {
      setLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(fileURL);
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        if (onNumPages) onNumPages(pdf.numPages);
        if (onPageChange) onPageChange(1);
        renderPage(pdf, 1);
      } catch (err) {
        console.error("PDF load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPDF();
    return () => {
      URL.revokeObjectURL(fileURL);
    };
  }, [pdfFile]);

  // Helper to get current page's annotation stack
  const getCurrentAnnotations = () => annotations[currentPage] || [];
  const getCurrentRedoStack = () => redoStack[currentPage] || [];

  // Save annotation for current page
  const saveCurrentAnnotations = (annots: ImageData[]) => {
    setAnnotations(prev => ({ ...prev, [currentPage]: annots }));
  };
  const saveCurrentRedoStack = (redo: ImageData[]) => {
    setRedoStack(prev => ({ ...prev, [currentPage]: redo }));
  };

  // Render page
  const renderPage = async (pdf: any, pageNumber: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: zoomLevel });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      ctx.fillStyle = darkMode ? "#333" : "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      if (annotationCanvasRef.current) {
        const annotCanvas = annotationCanvasRef.current;
        annotCanvas.width = canvas.width;
        annotCanvas.height = canvas.height;
        // Restore annotation for this page
        const pageAnnots = annotations[pageNumber];
        if (pageAnnots && pageAnnots.length > 0) {
          const ctx = annotCanvas.getContext("2d", { willReadFrequently: true });
          if (ctx) ctx.putImageData(pageAnnots[pageAnnots.length - 1], 0, 0);
        } else {
          const ctx = annotCanvas.getContext("2d", { willReadFrequently: true });
          if (ctx) ctx.clearRect(0, 0, annotCanvas.width, annotCanvas.height);
        }
      }
    } catch (err) {
      console.error("Render page error:", err);
    }
  };

  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage(pdfDocument, currentPage);
    }
  }, [zoomLevel, darkMode, currentPage]);

  // When changing page, save current annotation and load new one
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      // Save current annotation
      if (annotationCanvasRef.current) {
        const ctx = annotationCanvasRef.current.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, annotationCanvasRef.current.width, annotationCanvasRef.current.height);
          saveCurrentAnnotations([...getCurrentAnnotations(), imageData]);
        }
      }
      if (onPageChange) onPageChange(pageNumber);
      setTimeout(() => {
        // Restore annotation for new page
        if (annotationCanvasRef.current) {
          const ctx = annotationCanvasRef.current.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            const pageAnnots = annotations[pageNumber];
            if (pageAnnots && pageAnnots.length > 0) {
              ctx.putImageData(pageAnnots[pageAnnots.length - 1], 0, 0);
            } else {
              ctx.clearRect(0, 0, annotationCanvasRef.current.width, annotationCanvasRef.current.height);
            }
          }
        }
      }, 0);
    }
  };

  // Handle annotation drawing
  useEffect(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const startDrawing = (e: MouseEvent) => {
      if (activeTool === "cursor") return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setIsDrawing(true);
      setLastX(x);
      setLastY(y);
      if (activeTool === "highlighter" || activeTool === "pen") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing || activeTool === "cursor") return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      if (activeTool === "pen") {
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === "highlighter") {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = highlighterColor;
        ctx.lineWidth = penSize * 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      } else if (activeTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }
      setLastX(x);
      setLastY(y);
    };

    const stopDrawing = () => {
      if (isDrawing && activeTool !== "cursor") {
        setIsDrawing(false);
        const canvas = annotationCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newAnnots = [...getCurrentAnnotations(), imageData];
        saveCurrentAnnotations(newAnnots);
        saveCurrentRedoStack([]);
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [
    isDrawing,
    lastX,
    lastY,
    activeTool,
    penColor,
    penSize,
    highlighterColor,
    eraserSize,
  ]);

  // Undo/Redo per page
  const handleUndo = () => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const annots = getCurrentAnnotations();
    if (annots.length === 0) return;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const redo = getCurrentRedoStack();
    saveCurrentRedoStack([...redo, currentState]);
    const newAnnots = [...annots];
    newAnnots.pop();
    saveCurrentAnnotations(newAnnots);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newAnnots.length > 0) {
      ctx.putImageData(newAnnots[newAnnots.length - 1], 0, 0);
    }
  };

  const handleRedo = () => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const redo = getCurrentRedoStack();
    if (redo.length === 0) return;
    const newRedo = [...redo];
    const redoState = newRedo.pop();
    saveCurrentRedoStack(newRedo);
    if (redoState) {
      const annots = [...getCurrentAnnotations(), redoState];
      saveCurrentAnnotations(annots);
      ctx.putImageData(redoState, 0, 0);
    }
  };

  // Expose undo/redo to window for toolbar
  useEffect(() => {
    (window as any).pdfViewerUndo = handleUndo;
    (window as any).pdfViewerRedo = handleRedo;
    (window as any).pdfViewerSavePDF = async () => {
      if (!pdfDocument) return;
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const scaleFactor = 3; // Render at 3x for sharpness
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        // Render base PDF page to a canvas at the correct scale
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        const ptToPx = 96 / 72;
        const renderWidth = Math.round(pageWidth * ptToPx * scaleFactor);
        const renderHeight = Math.round(pageHeight * ptToPx * scaleFactor);
        const scale = Math.min(renderWidth / viewport.width, renderHeight / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = scaledViewport.width;
        tempCanvas.height = scaledViewport.height;
        const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
        if (!tempCtx) continue;
        await page.render({ canvasContext: tempCtx, viewport: scaledViewport }).promise;
        // Draw annotation if exists
        const annots = annotations[pageNum];
        if (annots && annots.length > 0) {
          const annot = annots[annots.length - 1];
          if (annot.width === tempCanvas.width && annot.height === tempCanvas.height) {
            tempCtx.putImageData(annot, 0, 0);
          } else {
            const annotCanvas = document.createElement("canvas");
            annotCanvas.width = annot.width;
            annotCanvas.height = annot.height;
            annotCanvas.getContext("2d", { willReadFrequently: true })?.putImageData(annot, 0, 0);
            tempCtx.drawImage(annotCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
          }
        }
        // Add note at the bottom of the page (if any)
        const note = notes[pageNum];
        if (note) {
          tempCtx.save();
          tempCtx.font = `${Math.round(tempCanvas.height * 0.025)}px sans-serif`;
          tempCtx.fillStyle = "#222";
          tempCtx.textAlign = "left";
          const padding = 24;
          const lines = note.split('\n');
          const lineHeight = Math.round(tempCanvas.height * 0.035);
          let y = tempCanvas.height - padding - (lines.length - 1) * lineHeight;
          lines.forEach(line => {
            tempCtx.fillText(line, padding, y);
            y += lineHeight;
          });
          tempCtx.restore();
        }
        // Add to PDF
        const imgData = tempCanvas.toDataURL("image/png");
        if (pageNum > 1) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      }
      pdf.save("annotated.pdf");
    };
    return () => {
      delete (window as any).pdfViewerUndo;
      delete (window as any).pdfViewerRedo;
      delete (window as any).pdfViewerSavePDF;
    };
  }, [handleUndo, handleRedo, pdfDocument, numPages, annotations, notes]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          handleUndo();
        } else if (e.key === "y") {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [annotations, redoStack]);

  // Apply zoom transform to the canvas container
  const containerStyle = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: "top left",
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-[600px]">
      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <p className="text-lg font-medium">Loading PDF...</p>
          </div>
        </div>
      )}
      {numPages > 0 && (
        <div className="mb-4 flex items-center gap-2 w-full justify-center">
          <button
            className={`px-2 py-1 rounded disabled:opacity-50 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className={darkMode ? 'text-white' : 'text-gray-900'}>Page {currentPage} of {numPages}</span>
          <button
            className={`px-2 py-1 rounded disabled:opacity-50 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
            disabled={currentPage >= numPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      <div className="w-full flex justify-center items-center overflow-auto" style={{ minHeight: 400 }}>
      <div className="relative" style={containerStyle}>
        <canvas ref={canvasRef} className="border shadow-sm" />
        <canvas
          ref={annotationCanvasRef}
          className="absolute top-0 left-0 z-10"
          style={{
            cursor: activeTool === "cursor" ? "default" : "crosshair",
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;