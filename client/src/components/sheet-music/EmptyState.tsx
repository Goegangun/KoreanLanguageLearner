import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadIcon, ListMusicIcon } from "lucide-react";

interface EmptyStateProps {
  type: "sheets" | "setlists";
  onAction: () => void;
}

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const isSheets = type === "sheets";
  
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
        {isSheets ? (
          <UploadIcon className="h-16 w-16 text-neutral-400 mb-4" />
        ) : (
          <ListMusicIcon className="h-16 w-16 text-neutral-400 mb-4" />
        )}
        
        <h3 className="text-lg font-semibold mb-2">
          {isSheets ? "저장된 악보가 없습니다" : "세트리스트가 없습니다"}
        </h3>
        
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs">
          {isSheets 
            ? "PDF 또는 이미지 형식의 악보를 업로드하여 언제 어디서나 볼 수 있습니다." 
            : "공연에 사용할 악보를 세트리스트로 구성하여 순서대로 볼 수 있습니다."}
        </p>
        
        <Button onClick={onAction}>
          {isSheets ? "악보 업로드하기" : "세트리스트 만들기"}
        </Button>
      </CardContent>
    </Card>
  );
}
