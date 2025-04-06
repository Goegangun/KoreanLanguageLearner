import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetMusic } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface ControlPanelProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  isAutoScrolling: boolean;
  scrollSpeed: number;
  setScrollSpeed: (speed: number) => void;
  startAutoScroll: () => void;
  stopAutoScroll: () => void;
  sheet: SheetMusic;
}

export default function ControlPanel({
  zoom,
  setZoom,
  zoomIn,
  zoomOut,
  brightness,
  setBrightness,
  isAutoScrolling,
  scrollSpeed,
  setScrollSpeed,
  startAutoScroll,
  stopAutoScroll,
  sheet,
}: ControlPanelProps) {
  const getSpeedText = (speed: number) => {
    if (speed <= 3) return "느린 속도";
    if (speed <= 7) return "중간 속도";
    return "빠른 속도";
  };

  return (
    <div className="w-72 bg-white dark:bg-neutral-900 border-l border-neutral-300 dark:border-neutral-700 p-4 overflow-y-auto">
      <div>
        <h3 className="text-md font-semibold mb-3">컨트롤</h3>

        {/* Zoom Controls */}
        <div className="mb-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">확대/축소</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={zoomOut}
            >
              <ZoomOutIcon className="h-4 w-4" />
            </Button>
            <input
              type="range"
              min="50"
              max="200"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={zoomIn}
            >
              <ZoomInIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center text-sm mt-1">{zoom}%</div>
        </div>

        {/* Brightness Control */}
        <div className="mb-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">밝기 조절</p>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer brightness-slider"
            />
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
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          </div>
        </div>

        {/* Auto-scroll Control */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">자동 스크롤</p>
            <Button
              variant={isAutoScrolling ? "destructive" : "default"}
              size="sm"
              className="rounded-full text-xs"
              onClick={isAutoScrolling ? stopAutoScroll : startAutoScroll}
            >
              {isAutoScrolling ? "중지" : "시작"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
              />
            </svg>
            <input
              type="range"
              min="1"
              max="10"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer auto-scroll-slider"
            />
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
                d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"
              />
            </svg>
          </div>
          <div className="text-center text-sm mt-1">{getSpeedText(scrollSpeed)}</div>
        </div>

        {/* Metadata */}
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-6">
          <h4 className="font-medium mb-2">악보 정보</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">곡 제목:</span>
              <span className="font-medium">{sheet.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">작곡가:</span>
              <span className="font-medium">{sheet.artist}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">장르:</span>
              <span className="font-medium">{sheet.genre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">업로드 날짜:</span>
              <span className="font-medium">{formatDate(sheet.uploadDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">페이지:</span>
              <span className="font-medium">{sheet.pages} 페이지</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
