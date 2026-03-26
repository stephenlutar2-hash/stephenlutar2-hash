import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ImportCenter from "@/pages/ImportCenter";
import MaritimeIntel from "@/pages/MaritimeIntel";
import DocumentProcessing from "@/pages/DocumentProcessing";
import SignalIntelligence from "@/pages/SignalIntelligence";
import Extensions from "@/pages/Extensions";
import { DomainChatWidget, CommandPalette, useAppCommands } from "@szl-holdings/ui";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-cyan-600 to-emerald-500 text-white text-center py-2 px-4 text-sm font-semibold">
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
      <Route path="/dashboard/:section?">{() => <AuthGuard component={Dashboard} />}</Route>
      <Route path="/import">{() => <AuthGuard component={ImportCenter} />}</Route>
      <Route path="/maritime-intel">{() => <AuthGuard component={MaritimeIntel} />}</Route>
      <Route path="/document-processing">{() => <AuthGuard component={DocumentProcessing} />}</Route>
      <Route path="/signal-intelligence">{() => <AuthGuard component={SignalIntelligence} />}</Route>
      <Route path="/extensions">{() => <AuthGuard component={Extensions} />}</Route>
      <Route path="/">{() => <Redirect to="/dashboard" />}</Route>
      <Route>{() => <Redirect to="/dashboard" />}</Route>
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="VESSELS" accentColor="#0ea5e9" />;
  }
  
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
        <DemoBanner />
        <Router />
        <DomainChatWidget
          agentType="vessels"
          agentName="Maritime Operations Agent"
          accentColor="#0ea5e9"
          accentHover="#0284c7"
          bgColor="#0c1222"
          textColor="#e2e8f0"
          borderColor="#1e3a5f"
          inputBg="#0f1d32"
          messageBgUser="#0ea5e9"
          messageBgAssistant="#0f1d32"
          placeholderText="Ask about fleet status, CII compliance, voyages, emissions, or maintenance..."
          getToken={() => localStorage.getItem("szl_token")}
        />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
