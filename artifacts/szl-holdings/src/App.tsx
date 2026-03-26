import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import Navigation from "./components/Navigation";
import Hero from "./sections/Hero";
import Footer from "./components/Footer";
import ImportCenter from "./pages/ImportCenter";
import { DomainChatWidget } from "@szl-holdings/ui";

const Vision = lazy(() => import("./sections/Vision"));
const EcosystemConstellation = lazy(() => import("./sections/EcosystemConstellation"));
const Metrics = lazy(() => import("./sections/Metrics"));
const Portfolio = lazy(() => import("./sections/Portfolio"));
const Timeline = lazy(() => import("./sections/Timeline"));
const About = lazy(() => import("./sections/About"));
const Innovation = lazy(() => import("./sections/Innovation"));
const InvestorBrief = lazy(() => import("./sections/InvestorBrief"));
const Contact = lazy(() => import("./sections/Contact"));

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

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/import" component={ImportCenter} />
        <Route component={LandingPage} />
      </Switch>
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
