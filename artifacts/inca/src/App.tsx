import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Experiments from "@/pages/Experiments";
import Insights from "@/pages/Insights";
import Models from "@/pages/Models";
import { DomainChatWidget } from "@szl-holdings/ui";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/projects" component={Projects} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/experiments" component={Experiments} />
            <Route path="/insights" component={Insights} />
            <Route path="/models" component={Models} />
            <Route>
              <Dashboard />
            </Route>
          </Switch>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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
