import { Switch, Route, Router as WouterRouter } from "wouter";
import { DomainChatWidget } from "@szl-holdings/ui";
import Home from "@/pages/Home";
import ImportCenter from "@/pages/ImportCenter";
import CostIntelligence from "@/pages/CostIntelligence";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/import" component={ImportCenter} />
      <Route path="/cost-intelligence" component={CostIntelligence} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
      <DomainChatWidget
        agentType="lyte"
        agentName="Lyte Observability Engineer"
        accentColor="#3b82f6"
        accentHover="#2563eb"
        bgColor="#0a0e14"
        textColor="#e2e8f0"
        borderColor="#1e2d4a"
        inputBg="#0f1520"
        messageBgUser="#3b82f6"
        messageBgAssistant="#0f1520"
        placeholderText="Ask about system health, infrastructure status, log analysis, or alert triage..."
        getToken={() => localStorage.getItem("szl_token")}
      />
    </WouterRouter>
  );
}

export default App;
