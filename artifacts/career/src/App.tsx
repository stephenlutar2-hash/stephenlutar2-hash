import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import ImportCenter from "@/pages/ImportCenter";
import SkillsRadar from "@/pages/SkillsRadar";
import AgentChat from "@/components/AgentChat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/import" component={ImportCenter} />
      <Route path="/skills-radar" component={SkillsRadar} />
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
      <AgentChat />
    </WouterRouter>
  );
}

export default App;
