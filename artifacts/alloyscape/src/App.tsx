import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
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
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
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
