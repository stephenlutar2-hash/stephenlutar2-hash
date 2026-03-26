import { CommandPalette, useAppCommands, DomainChatWidget, SocialShareWidget , EcosystemBar } from "@szl-holdings/ui";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import Home from "@/pages/Home";
import ImportCenter from "@/pages/ImportCenter";
import CostIntelligence from "@/pages/CostIntelligence";
import Extensions from "@/pages/Extensions";

function Router() {
  return (
    <Switch>
          <EcosystemBar currentApp="Lyte" />
      <Route path="/" component={Home} />
      <Route path="/import" component={ImportCenter} />
      <Route path="/cost-intelligence" component={CostIntelligence} />
      <Route path="/extensions" component={Extensions} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="LYTE" accentColor="#10b981" />;
  }
  
function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
      <Router />
      <SocialShareWidget
        appName="Lyte Observability"
        appContext="Lyte — infrastructure observability and cost intelligence by SZL Holdings"
        defaultHashtags={["#SZLHoldings", "#Lyte", "#Observability"]}
        accentColor="#10b981"
        getToken={() => localStorage.getItem("szl_token")}
      />
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
