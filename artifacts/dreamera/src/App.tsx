import { lazy, Suspense } from "react";
import { CommandPalette, useAppCommands, SocialShareWidget , EcosystemBar } from "@szl-holdings/ui";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { AuthGuard } from "@szl-holdings/platform";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DomainChatWidget } from "@szl-holdings/ui";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ImportCenter from "@/pages/ImportCenter";
import StoryIntelligence from "@/pages/StoryIntelligence";
import Extensions from "@/pages/Extensions";
import ContentPipeline from "@/pages/ContentPipeline";
import CampaignAnalytics from "@/pages/CampaignAnalytics";
import ContentCalendarPage from "@/pages/ContentCalendar";

const SocialDashboard = lazy(() => import("@/pages/social-command/SocialDashboard"));
const ContentGenerator = lazy(() => import("@/pages/social-command/ContentGenerator"));
const CarouselBuilder = lazy(() => import("@/pages/social-command/CarouselBuilder"));
const SocialContentCalendar = lazy(() => import("@/pages/social-command/ContentCalendar"));
const SocialAnalytics = lazy(() => import("@/pages/social-command/SocialAnalytics"));
const PlatformConnections = lazy(() => import("@/pages/social-command/PlatformConnections"));
const ContentLibrary = lazy(() => import("@/pages/social-command/ContentLibrary"));
const EngagementFeed = lazy(() => import("@/pages/social-command/EngagementFeed"));

const queryClient = new QueryClient();

function SectionFallback() {
  return (
    <div className="flex items-center justify-center h-96">
          <EcosystemBar currentApp="DreamEra" />
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Dashboard /></AuthGuard>}</Route>
      <Route path="/import">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ImportCenter /></AuthGuard>}</Route>
      <Route path="/story-intelligence">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><StoryIntelligence /></AuthGuard>}</Route>
      <Route path="/content-pipeline">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ContentPipeline /></AuthGuard>}</Route>
      <Route path="/campaign-analytics">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><CampaignAnalytics /></AuthGuard>}</Route>
      <Route path="/content-calendar">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><ContentCalendarPage /></AuthGuard>}</Route>

      <Route path="/social-command">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><SocialDashboard /></Suspense></AuthGuard>}</Route>
      <Route path="/social-command/generator">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><ContentGenerator /></Suspense></AuthGuard>}</Route>
      <Route path="/social-command/carousel">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><CarouselBuilder /></Suspense></AuthGuard>}</Route>
      <Route path="/social-command/calendar">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><SocialContentCalendar /></Suspense></AuthGuard>}</Route>
      <Route path="/social-command/analytics">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><SocialAnalytics /></Suspense></AuthGuard>}</Route>
      <Route path="/social-command/connections">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><PlatformConnections /></Suspense></AuthGuard>}</Route>
      <Route path="/social-command/library">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><ContentLibrary /></Suspense></AuthGuard>}</Route>
      <Route path="/social-command/engagement">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Suspense fallback={<SectionFallback />}><EngagementFeed /></Suspense></AuthGuard>}</Route>
      <Route path="/" component={Home} />
      <Route path="/extensions">{() => <AuthGuard redirectComponent={Redirect} loginPath="login"><Extensions /></AuthGuard>}</Route>
        <Route component={NotFound} />
    </Switch>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="DREAMERA" accentColor="#ec4899" />;
  }
  
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
        <Router />
      </WouterRouter>
      <SocialShareWidget
        appName="DreamEra Creative"
        appContext="DreamEra — creative technology, social media automation, and content strategy by SZL Holdings"
        defaultHashtags={["#SZLHoldings", "#DreamEra", "#CreativeTech"]}
        accentColor="#a855f7"
        commandCenterUrl="/dreamera/social-command"
        getToken={() => localStorage.getItem("szl_token")}
      />
      <DomainChatWidget
        agentType="dreamera"
        agentName="DreamEra Creative Director"
        accentColor="#a855f7"
        accentHover="#9333ea"
        bgColor="#0a0814"
        textColor="#e8e4f0"
        borderColor="#2a1a40"
        inputBg="#12101e"
        messageBgUser="#a855f7"
        messageBgAssistant="#12101e"
        placeholderText="Ask about content performance, campaign analytics, or creative strategy..."
        getToken={() => localStorage.getItem("szl_token")}
      />
    </QueryClientProvider>
  );
}

export default App;
