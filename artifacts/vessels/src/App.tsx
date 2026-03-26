import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { DomainChatWidget } from "@szl-holdings/ui";

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
      <Route path="/">{() => <Redirect to="/dashboard" />}</Route>
      <Route>{() => <Redirect to="/dashboard" />}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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
