import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, DomainChatWidget, CommandPalette, useAppCommands } from "@szl-holdings/ui";
import { AuthGuard, ErrorBoundary } from "@szl-holdings/platform";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ImportCenter from "@/pages/ImportCenter";
import ComplianceMatrix from "@/pages/ComplianceMatrix";
import Extensions from "@/pages/Extensions";

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
            <Router />
          </WouterRouter>
          <Toaster />
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
