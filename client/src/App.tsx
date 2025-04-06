import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ViewSheet from "@/pages/ViewSheet";
import MySheets from "@/pages/MySheets";
import Setlists from "@/pages/Setlists";
import Settings from "@/pages/Settings";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ViewSheet} />
      <Route path="/my-sheets" component={MySheets} />
      <Route path="/setlists" component={Setlists} />
      <Route path="/settings" component={Settings} />
      <Route path="/sheet/:id" component={ViewSheet} />
      <Route path="/setlist/:id" component={Setlists} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <TabNavigation />
      <main className="flex-1 overflow-hidden">
        <Router />
      </main>
      {isMobile && <BottomNavigation />}
      <Toaster />
    </div>
  );
}

export default App;
