import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { AuthGuard, ErrorBoundary } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, DomainChatWidget, CommandPalette, useAppCommands, SocialShareWidget } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import { LabBanner } from "@/components/LabBanner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Scenarios from "@/pages/Scenarios";
import Detections from "@/pages/Detections";
import ResponseTrainer from "@/pages/ResponseTrainer";
import Reports from "@/pages/Reports";
import ImportCenter from "@/pages/ImportCenter";
import AfterAction from "@/pages/AfterAction";
import Extensions from "@/pages/Extensions";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-600 to-red-500 text-white text-center py-2 px-4 text-sm font-semibold">
      Demo Mode — <button onClick={() => { localStorage.removeItem("szl_demo_mode"); localStorage.removeItem("szl_token"); localStorage.removeItem("szl_user"); window.location.href = import.meta.env.BASE_URL + "login"; }} className="underline ml-1">Sign up for full access</button>
    </div>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Dashboard /></AuthGuard>}</Route>
      <Route path="/scenarios">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Scenarios /></AuthGuard>}</Route>
      <Route path="/detections">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Detections /></AuthGuard>}</Route>
      <Route path="/response-trainer">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ResponseTrainer /></AuthGuard>}</Route>
      <Route path="/reports">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Reports /></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ImportCenter /></AuthGuard>}</Route>
      <Route path="/after-action">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AfterAction /></AuthGuard>}</Route>
      <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Extensions /></AuthGuard>}</Route>
      <Route path="/" component={Home} />
        <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="FIRESTORM" accentColor="#f97316" />;
  }
  
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LabBanner />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
            <DemoBanner />
            <Router />
          </WouterRouter>
          <Toaster />
          <SocialShareWidget
            appName="Firestorm Security"
            appContext="Firestorm — incident response simulation and threat detection lab by SZL Holdings"
            defaultHashtags={["#SZLHoldings", "#Firestorm", "#IncidentResponse"]}
            accentColor="#f97316"
            getToken={() => localStorage.getItem("szl_token")}
          />
          <DomainChatWidget
            agentType="firestorm"
            agentName="Firestorm Incident Response Strategist"
            accentColor="#f97316"
            accentHover="#ea580c"
            bgColor="#0a0a0a"
            textColor="#e2e8f0"
            borderColor="#3a2010"
            inputBg="#141010"
            messageBgUser="#f97316"
            messageBgAssistant="#141010"
            placeholderText="Ask about active incidents, threat landscape, scan results, or attack surface..."
            getToken={() => localStorage.getItem("szl_token")}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
