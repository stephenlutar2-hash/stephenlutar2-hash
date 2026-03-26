import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, DomainChatWidget } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import { ErrorBoundary, AuthGuard } from "@szl-holdings/platform";
import { Layout } from "@/components/Layout";
import Predictions from "@/pages/Predictions";
import Alerts from "@/pages/Alerts";
import EnsembleStudio from "@/pages/EnsembleStudio";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import ImportCenter from "@/pages/ImportCenter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><Predictions /></Layout></AuthGuard>}</Route>
      <Route path="/alerts">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><Alerts /></Layout></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><ImportCenter /></Layout></AuthGuard>}</Route>
      <Route path="/ensemble">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><EnsembleStudio /></Layout></AuthGuard>}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <DomainChatWidget
            agentType="nimbus"
            agentName="Nimbus Predictive Intelligence Analyst"
            accentColor="#22d3ee"
            accentHover="#06b6d4"
            bgColor="#060612"
            textColor="#e2e8f0"
            borderColor="#1a1a3a"
            inputBg="#0c0c20"
            messageBgUser="#7c3aed"
            messageBgAssistant="#0c0c20"
            placeholderText="Ask about predictions, confidence scores, alert patterns, or emerging trends..."
            getToken={() => localStorage.getItem("szl_token")}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
