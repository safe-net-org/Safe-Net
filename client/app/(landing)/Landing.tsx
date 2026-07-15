import CTA from '@/components/sections/CTA'
import Features from '@/components/sections/Features'
import Footer from '@/components/sections/Footer'
import GuardSection from '@/components/sections/GuardSection'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import Navigation from '@/components/sections/Navigation'
import Stats from '@/components/sections/Stats/Stats'
import Testimonials from '@/components/sections/Testimonials'
import Topics from '@/components/sections/Topics'

export default function Landing() {
	return (
		<div className='min-h-screen bg-slate-900 text-slate-100'>
			<Navigation />
			<Hero />
			<Stats />
			<Features />
			<Topics />
			<HowItWorks />
			<GuardSection />
			<Testimonials />
			<CTA />
			<Footer />
		</div>
	)
}
