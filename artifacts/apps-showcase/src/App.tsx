import { CommandPalette, useAppCommands, SocialShareWidget } from "@szl-holdings/ui";
import {Switch, Route, Router as WouterRouter, useLocation} from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import LiveDemos from "@/pages/LiveDemos";
import Extensions from "@/pages/Extensions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/live-demos" component={LiveDemos} />
      <Route path="/extensions" component={Extensions} />
      <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="SHOWCASE" accentColor="#0ea5e9" />;
  }
  
function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
      <Router />
      <SocialShareWidget
        appName="Apps Showcase"
        appContext="Explore the SZL Holdings app ecosystem — enterprise platforms across cybersecurity, maritime, AI, and more"
        defaultHashtags={["#SZLHoldings", "#AppShowcase", "#TechEcosystem"]}
        accentColor="#0ea5e9"
      />
    </WouterRouter>
  );
}

export default App;
