import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@workspace/ui";
import { TooltipProvider } from "@workspace/ui";
import { ErrorBoundary, AuthGuard } from "@workspace/platform";
import { Layout } from "@/components/Layout";
import Predictions from "@/pages/Predictions";
import Alerts from "@/pages/Alerts";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><Predictions /></Layout></AuthGuard>}</Route>
      <Route path="/alerts">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Layout><Alerts /></Layout></AuthGuard>}</Route>
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
