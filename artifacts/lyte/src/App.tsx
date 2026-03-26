import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import ImportCenter from "@/pages/ImportCenter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/import" component={ImportCenter} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
