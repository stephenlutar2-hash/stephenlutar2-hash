import { CommandPalette, useAppCommands, SocialShareWidget } from "@szl-holdings/ui";
import {Switch, Route, Router as WouterRouter, useLocation} from "wouter";
import Home from "@/pages/Home";
import ImportCenter from "@/pages/ImportCenter";
import SkillsRadar from "@/pages/SkillsRadar";
import AgentChat from "@/components/AgentChat";
import Extensions from "@/pages/Extensions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/import" component={ImportCenter} />
      <Route path="/skills-radar" component={SkillsRadar} />
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
    return <CommandPalette actions={commands} brandName="CAREER" accentColor="#22c55e" />;
  }
  
function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
      <Router />
      <AgentChat />
      <SocialShareWidget
        appName="Career Portfolio"
        appContext="Career Portfolio — showcasing professional journey and technical expertise at SZL Holdings"
        defaultHashtags={["#SZLHoldings", "#CareerGrowth", "#TechLeadership"]}
        accentColor="#22c55e"
      />
    </WouterRouter>
  );
}

export default App;
