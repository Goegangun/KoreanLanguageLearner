import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon, SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileControlPanel from "./MobileControlPanel";
import ControlPanel from "./ControlPanel";
import { SheetMusic } from "@shared/schema";
import { useSheetViewer } from "@/hooks/use-sheet-viewer";
import { renderPdfPage } from "@/lib/pdf-render";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface SheetMusicViewerProps {
  sheetId?: number;
}

export default function SheetMusicViewer({ sheetId }: SheetMusicViewerProps) {
  const isMobile = useIsMobile();
  const [showMobileControls, setShowMobileControls] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sheet music state
  const { data: sheetMusic } = useQuery<SheetMusic>({
    queryKey: sheetId ? [`/api/sheets/${sheetId}`] : ["/api/sheets/1"],
    enabled: !!sheetId,
  });

  // Get default sheet if no ID provided
  const { data: allSheets } = useQuery<SheetMusic[]>({
    queryKey: ["/api/sheets"],
    enabled: !sheetId,
  });

  // Combine to get the current sheet
  const currentSheet = sheetId && sheetMusic ? sheetMusic : allSheets?.[0];

  // Favorite mutation
  const { mutate: toggleFavorite } = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      if (!currentSheet) return;
      await apiRequest("PATCH", `/api/sheets/${currentSheet.id}`, {
        isFavorite,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets"] });
      if (sheetId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sheets/${sheetId}`] });
      }
    },
  });

  // Sheet viewer hooks
  const {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    isAutoScrolling,
    scrollSpeed,
    setScrollSpeed,
    startAutoScroll,
    stopAutoScroll,
    brightness,
    setBrightness,
  } = useSheetViewer();

  // Load PDF when sheet changes
  useEffect(() => {
    if (!currentSheet || !canvasRef.current) return;
    
    const renderSheet = async () => {
      if (currentSheet.fileType === "pdf") {
        const pdfData = atob(currentSheet.fileData);
        await renderPdfPage(canvasRef.current!, pdfData, currentPage, zoom, brightness);
      } else {
        // Display image
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          canvas.width = img.width * (zoom / 100);
          canvas.height = img.height * (zoom / 100);
          
          // Apply brightness
          ctx.filter = `brightness(${brightness}%)`;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = `data:image/png;base64,${currentSheet.fileData}`;
      }
    };
    
    renderSheet();
  }, [currentSheet, currentPage, zoom, brightness]);

  if (!currentSheet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>악보를 업로드해주세요</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Sheet Music Display */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">{currentSheet.title}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentSheet.artist}
            </p>
          </div>

          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => toggleFavorite(!currentSheet.isFavorite)}
            >
              {currentSheet.isFavorite ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-yellow-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-neutral-500 dark:text-neutral-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title="세트리스트에 추가"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-neutral-500 dark:text-neutral-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title="다운로드"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-neutral-500 dark:text-neutral-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Actual Sheet Music */}
        <div 
          ref={containerRef}
          className="sheet-music-container relative flex-1 bg-white dark:bg-neutral-900 rounded-lg shadow-sm overflow-auto border border-neutral-300 dark:border-neutral-700 flex justify-center"
        >
          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />

          {/* Page Navigation */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white dark:bg-neutral-800 shadow-md"
              onClick={prevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="bg-white dark:bg-neutral-800 py-2 px-4 rounded-full shadow-md text-sm">
              {currentPage} / {totalPages}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white dark:bg-neutral-800 shadow-md"
              onClick={nextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sheet Music Controls Mobile */}
        {isMobile && (
          <div className="md:hidden mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white dark:bg-neutral-800 shadow-md"
              onClick={zoomOut}
            >
              <ZoomOutIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white dark:bg-neutral-800 shadow-md"
              onClick={zoomIn}
            >
              <ZoomInIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-full bg-primary text-white shadow-md"
              onClick={() => setShowMobileControls(!showMobileControls)}
            >
              <SlidersHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Control Panel (Desktop) */}
      {!isMobile && (
        <ControlPanel
          zoom={zoom}
          setZoom={setZoom}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          brightness={brightness}
          setBrightness={setBrightness}
          isAutoScrolling={isAutoScrolling}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          startAutoScroll={startAutoScroll}
          stopAutoScroll={stopAutoScroll}
          sheet={currentSheet}
        />
      )}

      {/* Mobile Control Panel */}
      {isMobile && showMobileControls && (
        <MobileControlPanel
          brightness={brightness}
          setBrightness={setBrightness}
          isAutoScrolling={isAutoScrolling}
          scrollSpeed={scrollSpeed}
          setScrollSpeed={setScrollSpeed}
          startAutoScroll={startAutoScroll}
          stopAutoScroll={stopAutoScroll}
        />
      )}
    </div>
  );
}
