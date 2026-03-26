import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { AuthGuard } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@szl-holdings/ui";
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
