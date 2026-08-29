import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Method } from "@/components/method";
import { Concepts } from "@/components/concepts";
import { Capabilities } from "@/components/capabilities";
import { About } from "@/components/about";
import { Capabilities } from "@/components/capabilities";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { Concepts } from "@/components/concepts";
import { Method } from "@/components/method";
import { Services } from "@/components/services";
import { FAQ } from "@/components/faq";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { TooltipProvider } from "@/components/tooltip-provider";

export default function Home() {
  return (
    <>
      <TooltipProvider />
      <Nav />
      <main>
        <Hero />
        <Method />
        <Concepts />
        <Capabilities />
        <About />
        <Capabilities />
        <Skills />
        <Projects />
        <Concepts />
        <Method />
        <Services />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}