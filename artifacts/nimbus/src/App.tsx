import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, DomainChatWidget, CommandPalette, useAppCommands } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import { ErrorBoundary, AuthGuard } from "@szl-holdings/platform";
import { Layout } from "@/components/Layout";
import Predictions from "@/pages/Predictions";
import Alerts from "@/pages/Alerts";
import EnsembleStudio from "@/pages/EnsembleStudio";
import PredictionDrift from "@/pages/PredictionDrift";
import AnomalyTimeline from "@/pages/AnomalyTimeline";
import AlertCorrelation from "@/pages/AlertCorrelation";
import ConfidenceHistogram from "@/pages/ConfidenceHistogram";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import ImportCenter from "@/pages/ImportCenter";
import Extensions from "@/pages/Extensions";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-violet-600 to-purple-500 text-white text-center py-2 px-4 text-sm font-semibold">
      Demo Mode — <button onClick={() => { localStorage.removeItem("szl_demo_mode"); localStorage.removeItem("szl_token"); localStorage.removeItem("szl_user"); window.location.href = import.meta.env.BASE_URL + "login"; }} className="underline ml-1">Sign up for full access</button>
    </div>
  );
}

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
      <Route path="/drift">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><PredictionDrift /></Layout></AuthGuard>}</Route>
      <Route path="/anomalies">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><AnomalyTimeline /></Layout></AuthGuard>}</Route>
      <Route path="/correlation">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><AlertCorrelation /></Layout></AuthGuard>}</Route>
      <Route path="/confidence">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><ConfidenceHistogram /></Layout></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><ImportCenter /></Layout></AuthGuard>}</Route>
      <Route path="/ensemble">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><EnsembleStudio /></Layout></AuthGuard>}</Route>
      <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><Extensions /></Layout></AuthGuard>}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="NIMBUS" accentColor="#8b5cf6" />;
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
