import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { AuthGuard, ErrorBoundary } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, CommandPalette, useAppCommands, SocialShareWidget , EcosystemBar } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ImportCenter from "@/pages/ImportCenter";
import FinancialResearch from "@/pages/FinancialResearch";
import NotFound from "@/pages/not-found";
import Extensions from "@/pages/Extensions";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-emerald-600 to-green-500 text-white text-center py-2 px-4 text-sm font-semibold">
      Demo Mode — <button onClick={() => { localStorage.removeItem("szl_demo_mode"); localStorage.removeItem("szl_token"); localStorage.removeItem("szl_user"); window.location.href = import.meta.env.BASE_URL + "login"; }} className="underline ml-1">Sign up for full access</button>
    </div>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Landing} />
      <Route path="/dashboard">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Dashboard /></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ImportCenter /></AuthGuard>}</Route>
      <Route path="/financial-research">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><FinancialResearch /></AuthGuard>}</Route>
      <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Extensions /></AuthGuard>}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="LUTAR" accentColor="#f59e0b" />;
  }
  
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
            <DemoBanner />
            <Router />
          </WouterRouter>
          <EcosystemBar currentApp="Lutar" />
          <Toaster />
          <SocialShareWidget
            appName="Lutar Command Center"
            appContext="Lutar — financial command center and portfolio intelligence by SZL Holdings"
            defaultHashtags={["#SZLHoldings", "#Lutar", "#FinTech"]}
            accentColor="#f59e0b"
            getToken={() => localStorage.getItem("szl_token")}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
