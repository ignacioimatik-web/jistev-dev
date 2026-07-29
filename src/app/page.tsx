import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Method } from "@/components/method";
import { Concepts } from "@/components/concepts";
import { Capabilities } from "@/components/capabilities";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Method />
        <Concepts />
        <Capabilities />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
