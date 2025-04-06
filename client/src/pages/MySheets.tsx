import { useState } from "react";
import { Container } from "@/components/ui/container";
import { useQuery } from "@tanstack/react-query";
import { SheetMusic } from "@shared/schema";
import { PlusIcon, SearchIcon, StarIcon, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SheetCard from "@/components/sheet-music/SheetCard";
import EmptyState from "@/components/sheet-music/EmptyState";
import UploadDialog from "@/components/dialogs/UploadDialog";
import AddToSetlistDialog from "@/components/setlist/AddToSetlistDialog";

export default function MySheets() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddToSetlistDialogOpen, setIsAddToSetlistDialogOpen] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch sheets
  const { data: sheets, isLoading } = useQuery<SheetMusic[]>({
    queryKey: ["/api/sheets"],
  });
  
  // Fetch setlists for the add to setlist dialog
  const { data: setlists } = useQuery({
    queryKey: ["/api/setlists"],
  });
  
  // Filter and search sheets
  const filteredSheets = sheets?.filter(sheet => {
    // First apply tab filter
    if (activeTab === "favorites" && !sheet.isFavorite) return false;
    
    // Then apply search
    if (search && !sheet.title.toLowerCase().includes(search.toLowerCase()) &&
        !sheet.artist.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Finally apply genre filters
    if (filter.length > 0 && !filter.includes(sheet.genre)) {
      return false;
    }
    
    return true;
  });
  
  // Get unique genres for filter
  const genres = [...new Set(sheets?.map(sheet => sheet.genre) || [])];
  
  // Handle adding to setlist
  const handleAddToSetlist = (sheetId: number) => {
    setSelectedSheetId(sheetId);
    setIsAddToSetlistDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Container className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-md w-full max-w-sm"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-4">
      <div className="flex flex-col space-y-4">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">내 악보함</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="악보 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {genres.map(genre => (
                  <DropdownMenuCheckboxItem
                    key={genre}
                    checked={filter.includes(genre)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilter([...filter, genre]);
                      } else {
                        setFilter(filter.filter(g => g !== genre));
                      }
                    }}
                  >
                    {genre}
                  </DropdownMenuCheckboxItem>
                ))}
                {genres.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-neutral-500">
                    No genres available
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              <span>악보 추가</span>
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">전체 악보</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center">
              <StarIcon className="h-4 w-4 mr-1" />
              <span>즐겨찾기</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            {!sheets || sheets.length === 0 ? (
              <EmptyState 
                type="sheets"
                onAction={() => setIsUploadDialogOpen(true)}
              />
            ) : filteredSheets && filteredSheets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSheets.map(sheet => (
                  <SheetCard 
                    key={sheet.id} 
                    sheet={sheet} 
                    onAddToSetlist={handleAddToSetlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  검색어 또는 필터를 변경해보세요
                </p>
                <Button variant="outline" onClick={() => {
                  setSearch("");
                  setFilter([]);
                }}>
                  필터 초기화
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="m-0">
            {!sheets || sheets.filter(s => s.isFavorite).length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">즐겨찾기한 악보가 없습니다</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  악보를 즐겨찾기에 추가하여 빠르게 접근해보세요
                </p>
                <Button onClick={() => setActiveTab("all")}>
                  전체 악보 보기
                </Button>
              </div>
            ) : filteredSheets && filteredSheets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSheets.map(sheet => (
                  <SheetCard 
                    key={sheet.id} 
                    sheet={sheet} 
                    onAddToSetlist={handleAddToSetlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  검색어 또는 필터를 변경해보세요
                </p>
                <Button variant="outline" onClick={() => {
                  setSearch("");
                  setFilter([]);
                }}>
                  필터 초기화
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <UploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
      
      {selectedSheetId !== null && (
        <AddToSetlistDialog
          open={isAddToSetlistDialogOpen}
          onOpenChange={setIsAddToSetlistDialogOpen}
          setlistId={setlists?.[0]?.id || 0}
          availableSheets={sheets?.filter(s => s.id === selectedSheetId) || []}
        />
      )}
    </Container>
  );
}
