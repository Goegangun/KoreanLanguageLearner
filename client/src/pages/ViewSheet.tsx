import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import SheetMusicViewer from "@/components/sheet-music/SheetMusicViewer";
import UploadDialog from "@/components/dialogs/UploadDialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlusIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SheetMusic } from "@shared/schema";

export default function ViewSheet() {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Fetch all sheets to check if we have any
  const { data: sheets, isLoading } = useQuery<SheetMusic[]>({
    queryKey: ["/api/sheets"],
  });
  
  // Show upload dialog if no sheets are available
  useEffect(() => {
    if (!isLoading && sheets && sheets.length === 0 && !isUploadDialogOpen) {
      setIsUploadDialogOpen(true);
    }
  }, [sheets, isLoading, isUploadDialogOpen]);

  return (
    <Container>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <SheetMusicViewer sheetId={id ? parseInt(id) : undefined} />
          
          {/* Floating action button for adding new sheet music (mobile only) */}
          {isMobile && (
            <Button
              className="fixed right-6 bottom-20 p-4 bg-accent text-white rounded-full shadow-lg z-30"
              size="icon"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          )}
          
          <UploadDialog 
            open={isUploadDialogOpen} 
            onOpenChange={setIsUploadDialogOpen} 
          />
        </>
      )}
    </Container>
  );
}
