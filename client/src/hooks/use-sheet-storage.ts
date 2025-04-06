import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { SheetMusic, Setlist } from "@shared/schema";

export function useSheetStorage() {
  const { toast } = useToast();

  // Get all sheets
  const { data: sheets, isLoading: sheetsLoading } = useQuery<SheetMusic[]>({
    queryKey: ["/api/sheets"],
  });

  // Get all setlists
  const { data: setlists, isLoading: setlistsLoading } = useQuery<Setlist[]>({
    queryKey: ["/api/setlists"],
  });

  // Get a specific sheet
  const getSheet = (id: number) => {
    return useQuery<SheetMusic>({
      queryKey: [`/api/sheets/${id}`],
      enabled: !!id,
    });
  };

  // Get a specific setlist with its items
  const getSetlist = (id: number) => {
    return useQuery<Setlist & { items: any[] }>({
      queryKey: [`/api/setlists/${id}`],
      enabled: !!id,
    });
  };

  // Toggle favorite
  const { mutate: toggleFavorite } = useMutation({
    mutationFn: async ({
      id,
      isFavorite,
    }: {
      id: number;
      isFavorite: boolean;
    }) => {
      return apiRequest("PATCH", `/api/sheets/${id}`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets"] });
      toast({
        title: "즐겨찾기 업데이트",
        description: "즐겨찾기가 업데이트되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "즐겨찾기 상태를 변경하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete sheet
  const { mutate: deleteSheet } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/sheets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets"] });
      toast({
        title: "악보 삭제",
        description: "악보가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "악보를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Create setlist
  const { mutate: createSetlist } = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      return apiRequest("POST", "/api/setlists", { name, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/setlists"] });
      toast({
        title: "세트리스트 생성",
        description: "세트리스트가 생성되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "세트리스트를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete setlist
  const { mutate: deleteSetlist } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/setlists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/setlists"] });
      toast({
        title: "세트리스트 삭제",
        description: "세트리스트가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "세트리스트를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Add sheet to setlist
  const { mutate: addToSetlist } = useMutation({
    mutationFn: async ({
      setlistId,
      sheetMusicId,
    }: {
      setlistId: number;
      sheetMusicId: number;
    }) => {
      return apiRequest("POST", `/api/setlists/${setlistId}/items`, {
        sheetMusicId,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/setlists/${variables.setlistId}`],
      });
      toast({
        title: "악보 추가",
        description: "세트리스트에 악보가 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "세트리스트에 악보를 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Remove sheet from setlist
  const { mutate: removeFromSetlist } = useMutation({
    mutationFn: async ({
      setlistId,
      sheetMusicId,
    }: {
      setlistId: number;
      sheetMusicId: number;
    }) => {
      return apiRequest(
        "DELETE",
        `/api/setlists/${setlistId}/items/${sheetMusicId}`
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/setlists/${variables.setlistId}`],
      });
      toast({
        title: "악보 제거",
        description: "세트리스트에서 악보가 제거되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "세트리스트에서 악보를 제거하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  return {
    sheets,
    sheetsLoading,
    setlists,
    setlistsLoading,
    getSheet,
    getSetlist,
    toggleFavorite,
    deleteSheet,
    createSetlist,
    deleteSetlist,
    addToSetlist,
    removeFromSetlist,
  };
}
