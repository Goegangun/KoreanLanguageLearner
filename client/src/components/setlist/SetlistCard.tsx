import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListMusicIcon, ListIcon, TrashIcon, PencilIcon } from "lucide-react";
import { Setlist } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SetlistCardProps {
  setlist: Setlist;
}

export default function SetlistCard({ setlist }: SetlistCardProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Delete setlist mutation
  const { mutate: deleteSetlist, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/setlists/${setlist.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/setlists"] });
      toast({
        title: "세트리스트 삭제",
        description: "세트리스트가 성공적으로 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "세트리스트 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleView = () => {
    navigate(`/setlist/${setlist.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("이 세트리스트를 삭제하시겠습니까?")) {
      deleteSetlist();
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This would open an edit dialog, but for now just navigate to the setlist
    navigate(`/setlist/${setlist.id}`);
  };
  
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={handleView}>
      <CardContent className="p-5">
        <div className="flex items-start">
          <div className="p-3 bg-primary/10 rounded-lg mr-4">
            <ListMusicIcon className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-md mb-1">{setlist.name}</h3>
            
            {setlist.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                {setlist.description}
              </p>
            )}
            
            <div className="flex items-center text-xs text-neutral-500">
              <ListIcon className="h-3.5 w-3.5 mr-1" />
              <span>생성일: {formatDate(setlist.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 border-t bg-neutral-50 dark:bg-neutral-900 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          편집
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          삭제
        </Button>
      </CardFooter>
    </Card>
  );
}
