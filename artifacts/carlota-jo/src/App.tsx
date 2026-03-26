import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Consultation from "@/pages/Consultation";
import ImportCenter from "@/pages/ImportCenter";
import NotFound from "@/pages/not-found";
import { DomainChatWidget } from "@szl-holdings/ui";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/import" component={ImportCenter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
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
