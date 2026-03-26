import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { AuthGuard, ErrorBoundary } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@szl-holdings/ui";
import { TooltipProvider } from "@szl-holdings/ui";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Landing} />
      <Route path="/dashboard">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Dashboard /></AuthGuard>}</Route>
      <Route component={NotFound} />
    </Switch>
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
