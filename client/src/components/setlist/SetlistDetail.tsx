import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useSetlist } from "@/hooks/use-setlist";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { PlusIcon, GripVerticalIcon, XIcon, ArrowLeftIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import AddToSetlistDialog from "./AddToSetlistDialog";

export default function SetlistDetail() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { 
    setlist, 
    isLoading, 
    availableSheets,
    removeSheet,
    reordering,
    toggleReordering,
    reorderSheet
  } = useSetlist(parseInt(id));

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate("/setlists")}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            뒤로
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!setlist) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">세트리스트를 찾을 수 없습니다</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              요청하신 세트리스트가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => navigate("/setlists")}>
              세트리스트 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const item = setlist.items[sourceIndex];
    reorderSheet(item.sheetMusicId, destinationIndex);
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate("/setlists")}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          뒤로
        </Button>
        <h1 className="text-xl font-semibold">{setlist.name}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{setlist.name}</CardTitle>
              {setlist.description && (
                <CardDescription>{setlist.description}</CardDescription>
              )}
              <div className="text-xs text-neutral-500 mt-1">
                생성일: {formatDate(setlist.createdAt)} | 곡 수: {setlist.items.length}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleReordering}
              >
                {reordering ? "순서 저장" : "순서 변경"}
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                악보 추가
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {setlist.items.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-md">
              <h3 className="text-lg font-medium mb-2">아직 악보가 없습니다</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                이 세트리스트에 악보를 추가해보세요
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                악보 추가하기
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="setlist-items" isDropDisabled={!reordering}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {setlist.items.map((item, index) => (
                      <Draggable 
                        key={item.id.toString()} 
                        draggableId={item.id.toString()} 
                        index={index}
                        isDragDisabled={!reordering}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-3 bg-white dark:bg-neutral-800 border rounded-md flex items-center ${reordering ? 'cursor-grab active:cursor-grabbing' : ''}`}
                          >
                            {reordering && (
                              <div 
                                {...provided.dragHandleProps}
                                className="mr-2"
                              >
                                <GripVerticalIcon className="h-5 w-5 text-neutral-400" />
                              </div>
                            )}
                            
                            <Badge className="mr-3 bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200">
                              {index + 1}
                            </Badge>
                            
                            <div className="flex-1 mr-3">
                              <h4 className="font-medium">{item.sheet.title}</h4>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {item.sheet.artist}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/sheet/${item.sheet.id}`)}
                              >
                                보기
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => removeSheet(item.sheet.id)}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2 border-t">
          <div className="text-sm text-neutral-500">
            {reordering 
              ? "항목을 드래그하여 순서를 변경하세요" 
              : "이 세트리스트는 공연에서 사용할 악보를 모아둔 목록입니다"}
          </div>
        </CardFooter>
      </Card>
      
      <AddToSetlistDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        setlistId={parseInt(id)}
        availableSheets={availableSheets || []}
      />
    </div>
  );
}
