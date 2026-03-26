import { CommandPalette, useAppCommands, SocialShareWidget } from "@szl-holdings/ui";
import {Switch, Route, Router as WouterRouter, Redirect, useLocation} from "wouter";
import { AuthGuard } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DomainChatWidget } from "@szl-holdings/ui";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ImportCenter from "@/pages/ImportCenter";
import ArchitectureMap from "@/pages/ArchitectureMap";
import LogExplorer from "@/pages/LogExplorer";
import ModuleDependencyGraph from "@/pages/ModuleDependencyGraph";
import Extensions from "@/pages/Extensions";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Dashboard /></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ImportCenter /></AuthGuard>}</Route>
      <Route path="/architecture">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ArchitectureMap /></AuthGuard>}</Route>
      <Route path="/logs">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><LogExplorer /></AuthGuard>}</Route>
      <Route path="/dependencies">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ModuleDependencyGraph /></AuthGuard>}</Route>
      <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Extensions /></AuthGuard>}</Route>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="ZEUS" accentColor="#eab308" />;
  }
  
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
        <Router />
      </WouterRouter>
      <SocialShareWidget
        appName="Zeus Architecture"
        appContext="Zeus — infrastructure architecture mapping and system intelligence by SZL Holdings"
        defaultHashtags={["#SZLHoldings", "#Zeus", "#InfraArchitecture"]}
        accentColor="#eab308"
        getToken={() => localStorage.getItem("szl_token")}
      />
      <DomainChatWidget
        agentType="zeus"
        agentName="Zeus Infrastructure Architect"
        accentColor="#eab308"
        accentHover="#ca8a04"
        bgColor="#0a0e14"
        textColor="#e2e8f0"
        borderColor="#2a2510"
        inputBg="#121014"
        messageBgUser="#eab308"
        messageBgAssistant="#121014"
        placeholderText="Ask about system modules, architecture, logs, or infrastructure health..."
        getToken={() => localStorage.getItem("szl_token")}
      />
    </QueryClientProvider>
  );
}

export default App;
