import Hero from '../components/home/Hero'
import ProcessSteps from '../components/home/ProcessSteps'
import Advantages from '../components/home/Advantages'
import Reviews from '../components/home/Reviews'
import WhatsAppSection from '../components/home/WhatsAppSection'
import FinalCTA from '../components/home/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProcessSteps />
      <Advantages />
      <Reviews />
      <WhatsAppSection />
      <FinalCTA />
    </>
  )
}
