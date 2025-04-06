import { useState } from "react";
import { useParams } from "wouter";
import { Container } from "@/components/ui/container";
import { useQuery } from "@tanstack/react-query";
import { Setlist } from "@shared/schema";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SetlistCard from "@/components/setlist/SetlistCard";
import EmptyState from "@/components/sheet-music/EmptyState";
import CreateSetlistDialog from "@/components/setlist/CreateSetlistDialog";
import SetlistDetail from "@/components/setlist/SetlistDetail";

export default function Setlists() {
  const { id } = useParams<{ id: string }>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // If we have an ID, show the setlist detail view
  if (id) {
    return <SetlistDetail />;
  }
  
  // Fetch setlists
  const { data: setlists, isLoading } = useQuery<Setlist[]>({
    queryKey: ["/api/setlists"],
  });
  
  // Filter setlists based on search
  const filteredSetlists = setlists?.filter(setlist => 
    search === "" || 
    setlist.name.toLowerCase().includes(search.toLowerCase()) ||
    (setlist.description && setlist.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <Container className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-md w-full max-w-sm"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
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
          <h1 className="text-2xl font-bold">세트리스트</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="세트리스트 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              <span>세트리스트 생성</span>
            </Button>
          </div>
        </div>
        
        {/* Content */}
        {!setlists || setlists.length === 0 ? (
          <EmptyState 
            type="setlists"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        ) : filteredSetlists && filteredSetlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSetlists.map(setlist => (
              <SetlistCard key={setlist.id} setlist={setlist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              검색어를 변경해보세요
            </p>
            <Button variant="outline" onClick={() => setSearch("")}>
              검색 초기화
            </Button>
          </div>
        )}
      </div>
      
      <CreateSetlistDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </Container>
  );
}
