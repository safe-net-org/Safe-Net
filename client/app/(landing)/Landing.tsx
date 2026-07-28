import CTA from '@/components/sections/CTA'
import Features from '@/components/sections/Features'
import Footer from '@/components/sections/Footer'
import FeedbackCarousel from '@/components/sections/FeedbackCarousel'
import GuardSection from '@/components/sections/GuardSection'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import Navigation from '@/components/sections/Navigation'
import Stats from '@/components/sections/Stats/Stats'
import Testimonials from '@/components/sections/Testimonials'
import Topics from '@/components/sections/Topics'
import { LandingReveal } from '@/components/motion/LandingReveal'

export default function Landing() {
	return (
		<div
			id='top'
			className='landing-motion-scope min-h-screen bg-landing text-landing-foreground'
		>
			<Navigation />
			<LandingReveal>
				<Hero />
			</LandingReveal>
			<LandingReveal>
				<Stats />
			</LandingReveal>
			<LandingReveal>
				<Features />
			</LandingReveal>
			<LandingReveal>
				<GuardSection />
			</LandingReveal>
			<LandingReveal>
				<Topics />
			</LandingReveal>
			<LandingReveal>
				<HowItWorks />
			</LandingReveal>
			<LandingReveal>
				<Testimonials />
			</LandingReveal>
			<LandingReveal>
				<FeedbackCarousel />
			</LandingReveal>
			<LandingReveal>
				<CTA />
			</LandingReveal>
			<LandingReveal>
				<Footer />
			</LandingReveal>
		</div>
	)
}
