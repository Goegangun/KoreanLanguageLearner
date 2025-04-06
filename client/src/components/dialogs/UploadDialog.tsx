import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("클래식");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { mutate: uploadSheet, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("파일을 선택해주세요");
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("genre", genre);
      formData.append("file", file);
      
      const response = await fetch("/api/sheets", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "업로드 실패");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Reset form and close dialog
      setTitle("");
      setArtist("");
      setGenre("클래식");
      setFile(null);
      onOpenChange(false);
      
      // Invalidate sheets query
      queryClient.invalidateQueries({ queryKey: ["/api/sheets"] });
      
      toast({
        title: "업로드 성공",
        description: "악보가 성공적으로 업로드되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Check file type
    const fileType = selectedFile.type;
    if (!fileType.includes("pdf") && !fileType.includes("image")) {
      toast({
        title: "지원되지 않는 파일 형식",
        description: "PDF 또는 이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (20MB limit)
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "파일 크기는 최대 20MB까지 가능합니다.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "곡 제목 필요",
        description: "곡 제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (!artist.trim()) {
      toast({
        title: "아티스트 정보 필요",
        description: "아티스트 또는 작곡가 정보를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "파일 필요",
        description: "악보 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    uploadSheet();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 악보 추가</DialogTitle>
          <DialogDescription>
            버스킹에 사용할 악보를 업로드하고 관리하세요
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div 
            className={`p-6 border-2 border-dashed ${dragActive ? 'border-primary' : 'border-neutral-300 dark:border-neutral-700'} rounded-lg text-center mb-4`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center text-primary dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-neutral-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  다른 파일 선택
                </Button>
              </div>
            ) : (
              <>
                <UploadIcon className="h-10 w-10 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
                <p className="mb-2">PDF 또는 이미지 파일을 끌어다 놓거나</p>
                <Button
                  type="button"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  파일 선택
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  지원 형식: PDF, JPG, PNG (최대 20MB)
                </p>
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">곡 제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: Canon in D"
              />
            </div>
            
            <div>
              <Label htmlFor="artist">아티스트/작곡가</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="예: Johann Pachelbel"
              />
            </div>
            
            <div>
              <Label htmlFor="genre">장르</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="장르 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="클래식">클래식</SelectItem>
                  <SelectItem value="재즈">재즈</SelectItem>
                  <SelectItem value="팝">팝</SelectItem>
                  <SelectItem value="락">락</SelectItem>
                  <SelectItem value="발라드">발라드</SelectItem>
                  <SelectItem value="K-POP">K-POP</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "업로드 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
