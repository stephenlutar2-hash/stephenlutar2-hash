import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, CommandPalette, useAppCommands, SocialShareWidget, EcosystemBar } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import { ErrorBoundary } from "@szl-holdings/platform";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AlloyChat from "@/pages/AlloyChat";
import ImportCenter from "@/pages/ImportCenter";
import ThreatIntelFeed from "@/pages/ThreatIntelFeed";
import Extensions from "@/pages/Extensions";

function DemoBanner() {
  const isDemo = typeof window !== "undefined" && localStorage.getItem("szl_demo_mode") === "true";
  if (!isDemo) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-cyan-600 to-violet-500 text-white text-center py-2 px-4 text-sm font-semibold">
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

function AnimatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
    >
      <Component />
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/">{() => <AnimatedRoute component={Home} />}</Route>
        <Route path="/login">{() => <AnimatedRoute component={Login} />}</Route>
        <Route path="/dashboard">{() => <AnimatedRoute component={Dashboard} />}</Route>
        <Route path="/alloy">{() => <AnimatedRoute component={AlloyChat} />}</Route>
        <Route path="/import">{() => <AnimatedRoute component={ImportCenter} />}</Route>
        <Route path="/threat-intel">{() => <AnimatedRoute component={ThreatIntelFeed} />}</Route>
        <Route path="/extensions">{() => <AnimatedRoute component={Extensions} />}</Route>
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="ROSIE" accentColor="#ef4444" />;
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
          <EcosystemBar currentApp="ROSIE" />
          <Toaster />
          <SocialShareWidget
            appName="ROSIE Cybersecurity"
            appContext="ROSIE — AI-powered cybersecurity operations and threat intelligence by SZL Holdings"
            defaultHashtags={["#SZLHoldings", "#ROSIE", "#CyberSecurity"]}
            accentColor="#ef4444"
            getToken={() => localStorage.getItem("szl_token")}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
