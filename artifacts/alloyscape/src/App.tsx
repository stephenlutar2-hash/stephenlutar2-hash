import { CommandPalette, useAppCommands, SocialShareWidget , EcosystemBar } from "@szl-holdings/ui";
import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DomainChatWidget } from "@szl-holdings/ui";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Orchestration from "@/pages/Orchestration";
import Modules from "@/pages/Modules";
import WorkflowTemplates from "@/pages/WorkflowTemplates";
import ExecutionLogs from "@/pages/ExecutionLogs";
import ServiceStatus from "@/pages/ServiceStatus";
import Connectors from "@/pages/Connectors";
import UserRoles from "@/pages/UserRoles";
import ImportCenter from "@/pages/ImportCenter";
import AgentLeaderboard from "@/pages/AgentLeaderboard";
import Extensions from "@/pages/Extensions";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-cyan-600 to-blue-500 text-white text-center py-2 px-4 text-sm font-semibold">
          <EcosystemBar currentApp="AlloyScape" />
      Demo Mode — <button onClick={() => { localStorage.removeItem("szl_demo_mode"); localStorage.removeItem("szl_token"); localStorage.removeItem("szl_user"); window.location.href = import.meta.env.BASE_URL + "login"; }} className="underline ml-1">Sign up for full access</button>
    </div>
  );
}

const queryClient = new QueryClient();

function AuthGuard({ component: Component }: { component: React.ComponentType }) {
  const token = localStorage.getItem("szl_token");
  if (!token) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <AuthGuard component={Dashboard} />}</Route>
      <Route path="/orchestration">{() => <AuthGuard component={Orchestration} />}</Route>
      <Route path="/modules">{() => <AuthGuard component={Modules} />}</Route>
      <Route path="/workflows">{() => <AuthGuard component={WorkflowTemplates} />}</Route>
      <Route path="/logs">{() => <AuthGuard component={ExecutionLogs} />}</Route>
      <Route path="/services">{() => <AuthGuard component={ServiceStatus} />}</Route>
      <Route path="/connectors">{() => <AuthGuard component={Connectors} />}</Route>
      <Route path="/users">{() => <AuthGuard component={UserRoles} />}</Route>
      <Route path="/import">{() => <AuthGuard component={ImportCenter} />}</Route>
      <Route path="/leaderboard">{() => <AuthGuard component={AgentLeaderboard} />}</Route>
      <Route path="/extensions">{() => <AuthGuard component={Extensions} />}</Route>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="ALLOYSCAPE" accentColor="#14b8a6" />;
  }
  
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
        <DemoBanner />
        <Router />
      </WouterRouter>
      <SocialShareWidget
        appName="AlloyScape Infrastructure"
        appContext="AlloyScape — platform-wide operations and infrastructure orchestration by SZL Holdings"
        defaultHashtags={["#SZLHoldings", "#AlloyScape", "#PlatformOps"]}
        accentColor="#14b8a6"
        getToken={() => localStorage.getItem("szl_token")}
      />
      <DomainChatWidget
        agentType="alloyscape"
        agentName="AlloyScape Ops Commander"
        accentColor="#3b82f6"
        accentHover="#2563eb"
        bgColor="#080c16"
        textColor="#e2e8f0"
        borderColor="#1a2540"
        inputBg="#0c1220"
        messageBgUser="#6366f1"
        messageBgAssistant="#0c1220"
        placeholderText="Ask about platform-wide operations, security posture, system health, or executive briefings..."
        getToken={() => localStorage.getItem("szl_token")}
      />
    </QueryClientProvider>
  );
}

export default App;
