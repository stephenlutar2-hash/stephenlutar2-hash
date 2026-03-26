import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { AuthGuard } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ImportCenter from "@/pages/ImportCenter";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Dashboard /></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ImportCenter /></AuthGuard>}</Route>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
