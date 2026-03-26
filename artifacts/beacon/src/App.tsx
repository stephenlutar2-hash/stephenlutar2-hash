import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, DomainChatWidget } from "@szl-holdings/ui";
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
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
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
