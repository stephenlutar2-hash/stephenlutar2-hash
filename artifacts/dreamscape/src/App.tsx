import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Explorer from "@/pages/Explorer";
import Gallery from "@/pages/Gallery";
import HierarchyMap from "@/pages/HierarchyMap";
import PromptStudio from "@/pages/PromptStudio";
import History from "@/pages/History";

const queryClient = new QueryClient();

function AuthGuard({ component: Component }: { component: React.ComponentType }) {
  const token = localStorage.getItem("szl_token");
  if (!token) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <AuthGuard component={Dashboard} />}</Route>
      <Route path="/explore">{() => <AuthGuard component={Explorer} />}</Route>
      <Route path="/explore/:worldId">{() => <AuthGuard component={Explorer} />}</Route>
      <Route path="/gallery">{() => <AuthGuard component={Gallery} />}</Route>
      <Route path="/gallery/:worldId">{() => <AuthGuard component={Gallery} />}</Route>
      <Route path="/map">{() => <AuthGuard component={HierarchyMap} />}</Route>
      <Route path="/studio">{() => <AuthGuard component={PromptStudio} />}</Route>
      <Route path="/history">{() => <AuthGuard component={History} />}</Route>
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
