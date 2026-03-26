import {Switch, Route, Router as WouterRouter, useLocation} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Experiments from "@/pages/Experiments";
import ExperimentComparison from "@/pages/ExperimentComparison";
import RealTimeMetrics from "@/pages/RealTimeMetrics";
import ModelLeaderboard from "@/pages/ModelLeaderboard";
import HyperparameterChart from "@/pages/HyperparameterChart";
import ProjectHealth from "@/pages/ProjectHealth";
import ResourceUtilization from "@/pages/ResourceUtilization";
import Insights from "@/pages/Insights";
import Models from "@/pages/Models";
import ImportCenter from "@/pages/ImportCenter";
import ResearchFeed from "@/pages/ResearchFeed";
import DocumentIntelligence from "@/pages/DocumentIntelligence";
import DiscoveryRadar from "@/pages/DiscoveryRadar";
import { DomainChatWidget, CommandPalette, useAppCommands } from "@szl-holdings/ui";
import Extensions from "@/pages/Extensions";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-auto pb-20 md:pb-8">
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/projects" component={Projects} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/experiments" component={Experiments} />
            <Route path="/compare" component={ExperimentComparison} />
            <Route path="/realtime" component={RealTimeMetrics} />
            <Route path="/leaderboard" component={ModelLeaderboard} />
            <Route path="/hyperparams" component={HyperparameterChart} />
            <Route path="/health" component={ProjectHealth} />
            <Route path="/resources" component={ResourceUtilization} />
            <Route path="/insights" component={Insights} />
            <Route path="/models" component={Models} />
            <Route path="/import" component={ImportCenter} />
            <Route path="/research-feed" component={ResearchFeed} />
            <Route path="/document-intelligence" component={DocumentIntelligence} />
            <Route path="/discovery-radar" component={DiscoveryRadar} />
            <Route path="/extensions" component={Extensions} />
            <Route>
              <Dashboard />
            </Route>
          </Switch>
        </AnimatePresence>
      </main>
    </div>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="INCA" accentColor="#6366f1" />;
  }
  
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
        <Router />
        <DomainChatWidget
          agentType="inca"
          agentName="INCA Research Intelligence"
          accentColor="#6366f1"
          accentHover="#4f46e5"
          bgColor="#0f0f23"
          textColor="#e2e8f0"
          borderColor="#1e293b"
          inputBg="#1e1e3a"
          messageBgUser="#6366f1"
          messageBgAssistant="#1e1e3a"
          placeholderText="Ask about experiments, models, accuracy trends, or research projects..."
          getToken={() => localStorage.getItem("szl_token")}
        />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
