import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, DomainChatWidget, CommandPalette, useAppCommands, SocialShareWidget, EcosystemBar } from "@szl-holdings/ui";
import { AuthGuard, ErrorBoundary } from "@szl-holdings/platform";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ImportCenter from "@/pages/ImportCenter";
import ComplianceMatrix from "@/pages/ComplianceMatrix";
import Extensions from "@/pages/Extensions";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-600 to-yellow-500 text-black text-center py-2 px-4 text-sm font-semibold">
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
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ImportCenter /></AuthGuard>}</Route>
      <Route path="/compliance">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ComplianceMatrix /></AuthGuard>}</Route>
      <Route path="/" component={Home} />
      <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Extensions /></AuthGuard>}</Route>
        <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="AEGIS" accentColor="#3b82f6" />;
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
          <EcosystemBar currentApp="Aegis" />
          <Toaster />
          <SocialShareWidget
            appName="Aegis Security"
            appContext="Aegis — enterprise governance, compliance, and access control by SZL Holdings"
            defaultHashtags={["#SZLHoldings", "#AegisSecurity", "#Cybersecurity"]}
            accentColor="#10b981"
            getToken={() => localStorage.getItem("szl_token")}
          />
          <DomainChatWidget
            agentType="aegis"
            agentName="Aegis Governance & Compliance Advisor"
            accentColor="#10b981"
            accentHover="#059669"
            bgColor="#0a0f14"
            textColor="#e2e8f0"
            borderColor="#1e3a2f"
            inputBg="#0f1a16"
            messageBgUser="#10b981"
            messageBgAssistant="#0f1a16"
            placeholderText="Ask about compliance posture, audit logs, access control, or security policies..."
            getToken={() => localStorage.getItem("szl_token")}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
