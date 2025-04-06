import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpenIcon, FolderIcon, ListMusicIcon, SettingsIcon } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "악보 보기", icon: BookOpenIcon },
    { path: "/my-sheets", label: "내 악보함", icon: FolderIcon },
    { path: "/setlists", label: "세트리스트", icon: ListMusicIcon },
    { path: "/settings", label: "설정", icon: SettingsIcon },
  ];

  return (
    <nav className="bg-white dark:bg-neutral-900 border-t border-neutral-300 dark:border-neutral-700 py-2">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <div key={tab.path} className="relative">
            <Link href={tab.path}>
              <div
                className={cn(
                  "flex flex-col items-center px-4 py-2 cursor-pointer",
                  location === tab.path
                    ? "text-primary dark:text-blue-400"
                    : "text-neutral-500 dark:text-neutral-400"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{tab.label}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
