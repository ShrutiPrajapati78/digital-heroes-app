import Hero from "../components/hero";
import HowItWorks from "../components/howITworks";
import Prizes from "../components/prizes";
import Charities from "../components/charities";
import FinalCta from "../components/finalCta";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Prizes />
      <Charities />
      <FinalCta />
    </main>
  );
}