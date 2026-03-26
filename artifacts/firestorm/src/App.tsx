import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { AuthGuard, ErrorBoundary } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, DomainChatWidget } from "@szl-holdings/ui";
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
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LabBanner />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
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
