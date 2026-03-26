import { lazy, Suspense } from "react";
import {Switch, Route, Router as WouterRouter, useLocation} from "wouter";
import Navigation from "./components/Navigation";
import Hero from "./sections/Hero";
import Footer from "./components/Footer";
import ImportCenter from "./pages/ImportCenter";
import { DomainChatWidget, CommandPalette, useAppCommands, SocialShareWidget } from "@szl-holdings/ui";

const PressKit = lazy(() => import("./pages/PressKit"));

const Vision = lazy(() => import("./sections/Vision"));
const EcosystemConstellation = lazy(() => import("./sections/EcosystemConstellation"));
const Metrics = lazy(() => import("./sections/Metrics"));
const Portfolio = lazy(() => import("./sections/Portfolio"));
const Timeline = lazy(() => import("./sections/Timeline"));
const About = lazy(() => import("./sections/About"));
const Team = lazy(() => import("./sections/Team"));
const ThoughtLeadership = lazy(() => import("./sections/ThoughtLeadership"));
const ContentHub = lazy(() => import("./sections/ContentHub"));
const Innovation = lazy(() => import("./sections/Innovation"));
const InvestorBrief = lazy(() => import("./sections/InvestorBrief"));
const Contact = lazy(() => import("./sections/Contact"));
import Extensions from "@/pages/Extensions";

function SectionFallback() {
  return <div className="min-h-[200px]" />;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <Vision />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <EcosystemConstellation />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Metrics />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Portfolio />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Timeline />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Team />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ThoughtLeadership />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ContentHub />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Innovation />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <InvestorBrief />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}


  function CommandPaletteWrapper() {
    const [, navigate] = useLocation();
    const commands = useAppCommands(navigate);
    return <CommandPalette actions={commands} brandName="SZL" accentColor="#6366f1" />;
  }
  
function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <CommandPaletteWrapper />
      <Switch>
        <Route path="/import" component={ImportCenter} />
        <Route path="/extensions" component={Extensions} />
        <Route path="/press">{() => <Suspense fallback={<SectionFallback />}><PressKit /></Suspense>}</Route>
        <Route component={LandingPage} />
      </Switch>
      <SocialShareWidget
        appName="SZL Holdings"
        appContext="SZL Holdings — a premium innovation and venture platform building transformative technology"
        defaultHashtags={["#SZLHoldings", "#Innovation", "#TechVentures"]}
        accentColor="#d4a84b"
      />
      <DomainChatWidget
        agentType="szl-holdings"
        agentName="SZL Portfolio Concierge"
        accentColor="#d4a84b"
        accentHover="#c49a3a"
        bgColor="#0a0a0f"
        textColor="#e8e4dd"
        borderColor="#2a2520"
        inputBg="#141218"
        messageBgUser="#d4a84b"
        messageBgAssistant="#1a1820"
        placeholderText="Ask about SZL Holdings ventures, platforms, or how we can help..."
      />
    </WouterRouter>
  );
}

export default App;
