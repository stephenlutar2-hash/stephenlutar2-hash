import { CommandPalette, useAppCommands } from "@szl-holdings/ui";
import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { AuthGuard } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DomainChatWidget } from "@szl-holdings/ui";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ImportCenter from "@/pages/ImportCenter";
import StoryIntelligence from "@/pages/StoryIntelligence";
import Extensions from "@/pages/Extensions";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Dashboard /></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ImportCenter /></AuthGuard>}</Route>
      <Route path="/story-intelligence">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><StoryIntelligence /></AuthGuard>}</Route>
      <Route path="/" component={Home} />
      <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Extensions /></AuthGuard>}</Route>
        <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="DREAMERA" accentColor="#ec4899" />;
  }
  
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
        <Router />
      </WouterRouter>
      <DomainChatWidget
        agentType="dreamera"
        agentName="DreamEra Creative Director"
        accentColor="#a855f7"
        accentHover="#9333ea"
        bgColor="#0a0814"
        textColor="#e8e4f0"
        borderColor="#2a1a40"
        inputBg="#12101e"
        messageBgUser="#a855f7"
        messageBgAssistant="#12101e"
        placeholderText="Ask about content performance, campaign analytics, or creative strategy..."
        getToken={() => localStorage.getItem("szl_token")}
      />
    </QueryClientProvider>
  );
}

export default App;
