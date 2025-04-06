import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SheetMusic } from "@shared/schema";
import { formatDate, getFileTypeIconClass } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface SheetCardProps {
  sheet: SheetMusic;
  onAddToSetlist?: (sheetId: number) => void;
}

export default function SheetCard({ sheet, onAddToSetlist }: SheetCardProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Toggle favorite mutation
  const { mutate: toggleFavorite } = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      await apiRequest("PATCH", `/api/sheets/${sheet.id}`, {
        isFavorite,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets"] });
    },
  });

  // Delete sheet mutation
  const { mutate: deleteSheet, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/sheets/${sheet.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets"] });
      toast({
        title: "악보 삭제",
        description: "악보가 성공적으로 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "악보 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleView = () => {
    navigate(`/sheet/${sheet.id}`);
  };

  const handleFavorite = () => {
    toggleFavorite(!sheet.isFavorite);
  };

  const handleDelete = () => {
    if (confirm("이 악보를 삭제하시겠습니까?")) {
      deleteSheet();
    }
  };

  const handleAddToSetlist = () => {
    if (onAddToSetlist) {
      onAddToSetlist(sheet.id);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div 
        className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center cursor-pointer"
        onClick={handleView}
      >
        {sheet.fileType === "image" ? (
          <div className="w-full h-full overflow-hidden flex items-center justify-center">
            <img 
              src={`data:image/png;base64,${sheet.fileData.substring(0, 100)}`} 
              alt={sheet.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 text-neutral-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span className="text-sm text-neutral-500">PDF 악보</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-md mb-1 line-clamp-1">{sheet.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">{sheet.artist}</p>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full px-2 py-1">
              {sheet.genre}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-5 h-5 ${getFileTypeIconClass(sheet.fileType)}`}
            >
              {sheet.fileType === 'pdf' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              )}
            </svg>
            <span className="ml-1">{sheet.pages}페이지</span>
          </div>
          <span>•</span>
          <span>{formatDate(sheet.uploadDate)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 border-t bg-neutral-50 dark:bg-neutral-900 flex justify-between">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleFavorite}
          >
            {sheet.isFavorite ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-yellow-500"
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
                className="w-4 h-4"
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
            size="sm"
            onClick={handleAddToSetlist}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
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
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </Button>
        </div>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={handleView}
        >
          보기
        </Button>
      </CardFooter>
    </Card>
  );
}
