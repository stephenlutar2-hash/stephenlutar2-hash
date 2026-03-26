import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    </QueryClientProvider>
  );
}

export default App;
