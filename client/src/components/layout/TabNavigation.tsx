import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TabNavigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  // Hide tab navigation on mobile (bottom nav instead)
  if (isMobile) return null;

  const tabs = [
    { path: "/", label: "악보 보기" },
    { path: "/my-sheets", label: "내 악보함" },
    { path: "/setlists", label: "세트리스트" },
    { path: "/settings", label: "설정" },
  ];

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-300 dark:border-neutral-700">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <div key={tab.path} className="relative">
            <Link href={tab.path}>
              <span
                className={cn(
                  "px-6 py-3 font-medium cursor-pointer block",
                  location === tab.path
                    ? "text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-blue-400"
                )}
              >
                {tab.label}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
