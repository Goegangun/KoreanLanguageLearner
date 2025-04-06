import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchIcon, MusicIcon } from "lucide-react";
import { SheetMusic } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddToSetlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setlistId: number;
  availableSheets: SheetMusic[];
}

export default function AddToSetlistDialog({ 
  open, 
  onOpenChange,
  setlistId,
  availableSheets 
}: AddToSetlistDialogProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  
  // Add sheet to setlist mutation
  const { mutate: addToSetlist, isPending } = useMutation({
    mutationFn: async (sheetId: number) => {
      return apiRequest("POST", `/api/setlists/${setlistId}/items`, {
        sheetMusicId: sheetId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/setlists/${setlistId}`] });
      toast({
        title: "악보 추가됨",
        description: "세트리스트에 악보가 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "추가 실패",
        description: "악보를 세트리스트에 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Filter sheets based on search
  const filteredSheets = availableSheets.filter(sheet => 
    search === "" || 
    sheet.title.toLowerCase().includes(search.toLowerCase()) ||
    sheet.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>세트리스트에 악보 추가</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="악보 검색..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {availableSheets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-600 dark:text-neutral-400">
              추가할 수 있는 악보가 없습니다.
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              먼저 악보를 업로드하거나, 이미 모든 악보가 세트리스트에 포함되어 있습니다.
            </p>
          </div>
        ) : filteredSheets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-600 dark:text-neutral-400">
              검색 결과가 없습니다.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-72">
            <div className="space-y-2 pr-4">
              {filteredSheets.map(sheet => (
                <div 
                  key={sheet.id}
                  className="p-3 border rounded-md flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-md mr-3">
                      <MusicIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{sheet.title}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {sheet.artist}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => addToSetlist(sheet.id)}
                    disabled={isPending}
                  >
                    추가
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
