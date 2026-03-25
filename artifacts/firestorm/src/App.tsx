import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LabBanner } from "@/components/LabBanner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Scenarios from "@/pages/Scenarios";
import Detections from "@/pages/Detections";
import ResponseTrainer from "@/pages/ResponseTrainer";
import Reports from "@/pages/Reports";

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
      <Route path="/scenarios">{() => <AuthGuard component={Scenarios} />}</Route>
      <Route path="/detections">{() => <AuthGuard component={Detections} />}</Route>
      <Route path="/response-trainer">{() => <AuthGuard component={ResponseTrainer} />}</Route>
      <Route path="/reports">{() => <AuthGuard component={Reports} />}</Route>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LabBanner />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
