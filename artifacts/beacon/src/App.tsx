import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import { ErrorBoundary, AuthGuard } from "@szl-holdings/platform";
import NotFound from "@/pages/not-found";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Zeus from "./pages/Zeus";
import Inca from "./pages/Inca";
import DreamEra from "./pages/DreamEra";
import ImportCenter from "./pages/ImportCenter";

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
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
