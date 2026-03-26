import { CommandPalette, useAppCommands, SocialShareWidget } from "@szl-holdings/ui";
import {Switch, Route, Router as WouterRouter, useLocation} from "wouter";
import Home from "@/pages/Home";
import PredictiveReadiness from "@/pages/PredictiveReadiness";
import AgentChat from "@/components/AgentChat";
import Extensions from "@/pages/Extensions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/predictive-readiness" component={PredictiveReadiness} />
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
    return <CommandPalette actions={commands} brandName="READINESS" accentColor="#f97316" />;
  }
  
function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
      <Router />
      <AgentChat />
      <SocialShareWidget
        appName="Readiness Report"
        appContext="Readiness Report — predictive readiness assessment and launch preparation by SZL Holdings"
        defaultHashtags={["#SZLHoldings", "#ReadinessReport", "#LaunchReady"]}
        accentColor="#f97316"
      />
    </WouterRouter>
  );
}

export default App;
