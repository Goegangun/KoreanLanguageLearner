import { useState } from "react";
import { useSheetStorage } from "./use-sheet-storage";
import { useToast } from "@/hooks/use-toast";
import { SheetMusic } from "@shared/schema";

export function useSetlist(setlistId?: number) {
  const { toast } = useToast();
  const [reordering, setReordering] = useState(false);
  
  const {
    getSetlist,
    sheets,
    addToSetlist,
    removeFromSetlist
  } = useSheetStorage();
  
  // Get setlist data if ID is provided
  const { data: setlist, isLoading } = getSetlist(setlistId || 0);
  
  // Get sheets not in the current setlist
  const availableSheets = sheets?.filter(
    (sheet) => !setlist?.items.some((item) => item.sheetMusicId === sheet.id)
  ) || [];
  
  // Add a sheet to the setlist
  const addSheet = (sheetId: number) => {
    if (!setlistId) {
      toast({
        title: "오류",
        description: "세트리스트가 선택되지 않았습니다.",
        variant: "destructive",
      });
      return;
    }
    
    addToSetlist({ setlistId, sheetMusicId: sheetId });
  };
  
  // Remove a sheet from the setlist
  const removeSheet = (sheetId: number) => {
    if (!setlistId) {
      toast({
        title: "오류",
        description: "세트리스트가 선택되지 않았습니다.",
        variant: "destructive",
      });
      return;
    }
    
    removeFromSetlist({ setlistId, sheetMusicId: sheetId });
  };
  
  // Toggle reordering mode
  const toggleReordering = () => setReordering(!reordering);
  
  // Reorder a sheet in the setlist
  const reorderSheet = async (sheetId: number, newOrder: number) => {
    if (!setlistId) return;
    
    try {
      await fetch(`/api/setlists/${setlistId}/items/${sheetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order: newOrder }),
      });
      
      // Refresh setlist
      getSetlist(setlistId);
    } catch (error) {
      toast({
        title: "순서 변경 실패",
        description: "세트리스트 순서를 변경하는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return {
    setlist,
    isLoading,
    availableSheets,
    addSheet,
    removeSheet,
    reordering,
    toggleReordering,
    reorderSheet,
  };
}
