import Navigation from "./components/Navigation";
import Hero from "./sections/Hero";
import Vision from "./sections/Vision";
import Portfolio from "./sections/Portfolio";
import About from "./sections/About";
import Innovation from "./sections/Innovation";
import Contact from "./sections/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <Hero />
        <Vision />
        <Portfolio />
        <About />
        <Innovation />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
