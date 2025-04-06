import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface CreateSetlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateSetlistDialog({ open, onOpenChange }: CreateSetlistDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: createSetlist, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/setlists", {
        name,
        description: description || undefined,
        userId: 1 // Default user ID
      });
      return response;
    },
    onSuccess: () => {
      // Reset form and close dialog
      setName("");
      setDescription("");
      onOpenChange(false);
      
      // Invalidate setlists query
      queryClient.invalidateQueries({ queryKey: ["/api/setlists"] });
      
      toast({
        title: "세트리스트 생성 완료",
        description: "세트리스트가 성공적으로 생성되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "세트리스트 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "세트리스트 이름 필요",
        description: "세트리스트 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    createSetlist();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 세트리스트 만들기</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">세트리스트 이름</Label>
              <Input
                id="name"
                placeholder="예: 주말 버스킹"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="예: 토요일 홍대 버스킹용 세트리스트"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "생성 중..." : "생성하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
