import Navbar from '@/components/Layout/Navbar';
import Hero from '@/components/Layout/Hero';
import Work from '@/components/Layout/Work';
import Why from '@/components/Layout/Why';
import Community from '@/components/Layout/Community';
import Footer from '@/components/Layout/Footer';

function page() {
  return (
    <div className='flex flex-col'>
      <Navbar />
      <Hero />
      <Work/>
      <Why/>
      <Community/>
      <Footer/>
    </div>
  )
}

export default page