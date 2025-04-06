import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Settings as SettingsType } from "@shared/schema";
import { clearPdfCache } from "@/lib/pdf-render";
import { MoonIcon, SunIcon, DownloadIcon, SlidersHorizontalIcon, SmileIcon, CpuIcon, SettingsIcon } from "lucide-react";

// Utility to get cache size
async function getCacheSize(): Promise<string> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    if (estimate.usage) {
      return (estimate.usage / (1024 * 1024)).toFixed(2) + " MB";
    }
  }
  return "Unknown";
}

export default function Settings() {
  const { toast } = useToast();
  
  // Local dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  
  // State for showing settings
  const [defaultZoom, setDefaultZoom] = useState(100);
  const [defaultScrollSpeed, setDefaultScrollSpeed] = useState(5);
  const [defaultBrightness, setDefaultBrightness] = useState(100);
  const [cacheSize, setCacheSize] = useState<string>("계산 중...");
  
  // Fetch settings
  const { data: settings, isLoading } = useQuery<SettingsType>({
    queryKey: ["/api/settings"],
  });
  
  // Initialize settings from API data
  useEffect(() => {
    if (settings) {
      setDefaultZoom(settings.defaultZoom);
      setDefaultScrollSpeed(settings.defaultScrollSpeed);
      setDefaultBrightness(settings.defaultBrightness);
    }
  }, [settings]);
  
  // Get cache size on load
  useEffect(() => {
    getCacheSize().then(setCacheSize);
  }, []);
  
  // Save settings mutation
  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: async (newSettings: Partial<SettingsType>) => {
      await apiRequest("PATCH", "/api/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "설정 저장 완료",
        description: "설정이 성공적으로 저장되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "설정 저장 실패",
        description: "설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });
  
  // Save individual settings as they change
  useEffect(() => {
    // Debounce the save operation
    const handler = setTimeout(() => {
      if (settings && (
        defaultZoom !== settings.defaultZoom ||
        defaultScrollSpeed !== settings.defaultScrollSpeed ||
        defaultBrightness !== settings.defaultBrightness
      )) {
        saveSettings({
          defaultZoom,
          defaultScrollSpeed,
          defaultBrightness
        });
      }
    }, 500);
    
    return () => clearTimeout(handler);
  }, [defaultZoom, defaultScrollSpeed, defaultBrightness, settings, saveSettings]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem('darkMode', String(newDarkMode));
    
    // Update server settings
    saveSettings({ darkMode: newDarkMode });
  };
  
  // Clear cache
  const handleClearCache = async () => {
    try {
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear PDF cache
      clearPdfCache();
      
      // Update cache size
      const newSize = await getCacheSize();
      setCacheSize(newSize);
      
      toast({
        title: "캐시 삭제 완료",
        description: "애플리케이션 캐시가 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "캐시 삭제 실패",
        description: "캐시를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <Container className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-md w-40"></div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-4">
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      
      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontalIcon className="h-5 w-5 text-primary" />
              <CardTitle>화면 설정</CardTitle>
            </div>
            <CardDescription>
              애플리케이션의 외관 및 디스플레이 설정을 변경합니다
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>다크 모드</Label>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  어두운 테마로 전환하여 눈의 피로를 줄입니다
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SunIcon className="h-4 w-4 text-yellow-500" />
                <Switch 
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
                <MoonIcon className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>기본 확대/축소 ({defaultZoom}%)</Label>
              <Slider
                value={[defaultZoom]}
                min={50}
                max={200}
                step={5}
                onValueChange={([value]) => setDefaultZoom(value)}
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>50%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>기본 밝기 ({defaultBrightness}%)</Label>
              <Slider
                value={[defaultBrightness]}
                min={50}
                max={150}
                step={5}
                onValueChange={([value]) => setDefaultBrightness(value)}
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>어두움</span>
                <span>보통</span>
                <span>밝음</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>기본 스크롤 속도 ({defaultScrollSpeed})</Label>
              <Slider
                value={[defaultScrollSpeed]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setDefaultScrollSpeed(value)}
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>느림</span>
                <span>보통</span>
                <span>빠름</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* System Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CpuIcon className="h-5 w-5 text-primary" />
              <CardTitle>시스템</CardTitle>
            </div>
            <CardDescription>
              애플리케이션 데이터 및 저장소 관리
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">오프라인 사용</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  인터넷 연결 없이도 사용 가능한 악보 및 설정 저장
                </p>
              </div>
              <DownloadIcon className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">캐시 크기</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  현재 사용 중인 캐시 크기: {cacheSize}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                캐시 삭제
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <SmileIcon className="h-4 w-4" />
                <span>ScoreScroll 버전 1.0.0</span>
              </div>
              
              <Button variant="link" size="sm" className="text-neutral-500">
                <SettingsIcon className="h-4 w-4 mr-1" />
                <span>기본값으로 초기화</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Container>
  );
}
