import {Switch, Route, Router as WouterRouter, useLocation} from "wouter";
import Home from "@/pages/Home";
import Consultation from "@/pages/Consultation";
import ImportCenter from "@/pages/ImportCenter";
import Pipeline from "@/pages/Pipeline";
import MeetingIntelligence from "@/pages/MeetingIntelligence";
import ClientDossier from "@/pages/ClientDossier";
import NotFound from "@/pages/not-found";
import { DomainChatWidget, CommandPalette, useAppCommands, SocialShareWidget , EcosystemBar } from "@szl-holdings/ui";
import Extensions from "@/pages/Extensions";

function Router() {
  return (
    <Switch>
          <EcosystemBar currentApp="Carlota Jo" />
      <Route path="/" component={Home} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/import" component={ImportCenter} />
      <Route path="/pipeline" component={Pipeline} />
      <Route path="/meeting-intelligence" component={MeetingIntelligence} />
      <Route path="/client-dossier" component={ClientDossier} />
      <Route path="/extensions" component={Extensions} />
      <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="CARLOTA JO" accentColor="#d946ef" />;
  }
  
function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
      <Router />
      <SocialShareWidget
        appName="Carlota Jo Consulting"
        appContext="Carlota Jo — strategic consulting and enterprise advisory by SZL Holdings"
        defaultHashtags={["#SZLHoldings", "#CarlotaJo", "#StrategicConsulting"]}
        accentColor="#7c3aed"
      />
      <DomainChatWidget
        agentType="carlota-jo"
        agentName="Strategic Engagement Advisor"
        accentColor="#7c3aed"
        accentHover="#6d28d9"
        bgColor="#0f0a1a"
        textColor="#e8e4f0"
        borderColor="#2a2040"
        inputBg="#1a1228"
        messageBgUser="#7c3aed"
        messageBgAssistant="#1a1228"
        placeholderText="Ask about consulting services, practice areas, or book a consultation..."
      />
    </WouterRouter>
  );
}

export default App;
