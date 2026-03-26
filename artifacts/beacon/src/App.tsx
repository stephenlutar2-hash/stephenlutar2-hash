import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, DomainChatWidget, CommandPalette, useAppCommands, SocialShareWidget } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import { ErrorBoundary, AuthGuard } from "@szl-holdings/platform";
import NotFound from "@/pages/not-found";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Zeus from "./pages/Zeus";
import Inca from "./pages/Inca";
import DreamEra from "./pages/DreamEra";
import ImportCenter from "./pages/ImportCenter";
import AnomalyCorrelation from "./pages/AnomalyCorrelation";
import TrendForecasting from "./pages/TrendForecasting";
import MetricTileGrid from "./pages/MetricTileGrid";
import CrossAppHealthMatrix from "./pages/CrossAppHealthMatrix";
import Extensions from "@/pages/Extensions";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-cyan-600 to-blue-500 text-white text-center py-2 px-4 text-sm font-semibold">
      Demo Mode — <button onClick={() => { localStorage.removeItem("szl_demo_mode"); localStorage.removeItem("szl_token"); localStorage.removeItem("szl_user"); window.location.href = import.meta.env.BASE_URL + "login"; }} className="underline ml-1">Sign up for full access</button>
    </div>
  );
}

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/login">{() => <AnimatedRoute><Login /></AnimatedRoute>}</Route>
        <Route path="/">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><Dashboard /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/zeus">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><Zeus /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/inca">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><Inca /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/dreamera">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><DreamEra /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><ImportCenter /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/anomaly-correlation">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><AnomalyCorrelation /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/trend-forecasting">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><TrendForecasting /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/metric-tiles">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><MetricTileGrid /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/health-matrix">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><CrossAppHealthMatrix /></AnimatedRoute></AuthGuard>}</Route>
        <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><AnimatedRoute><Extensions /></AnimatedRoute></AuthGuard>}</Route>
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="BEACON" accentColor="#06b6d4" />;
  }
  
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
            <DemoBanner />
            <Router />
          </WouterRouter>
          <Toaster />
          <SocialShareWidget
            appName="Beacon Analytics"
            appContext="Check out Beacon Analytics — real-time KPI tracking and performance intelligence by SZL Holdings"
            defaultHashtags={["#SZLHoldings", "#BeaconAnalytics", "#DataDriven"]}
            accentColor="#0ea5e9"
            getToken={() => localStorage.getItem("szl_token")}
          />
          <DomainChatWidget
            agentType="beacon"
            agentName="Beacon Performance Analyst"
            accentColor="#0ea5e9"
            accentHover="#0284c7"
            bgColor="#0a0e1a"
            textColor="#e2e8f0"
            borderColor="#1e2d4a"
            inputBg="#0f1528"
            messageBgUser="#0ea5e9"
            messageBgAssistant="#0f1528"
            placeholderText="Ask about KPI trends, project health, performance anomalies, or business metrics..."
            getToken={() => localStorage.getItem("szl_token")}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
