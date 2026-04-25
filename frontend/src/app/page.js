import React from 'react';
import Navbar from './Navbar';
import HeroPage from './HeroPage';
import ServicesSection from './ServicesSection';
import HowItWorksSection from './HowItWorksSection';
import SocietyPartnershipSection from "@/components/SocietyPartnershipSection";
import Footer from './Footer';

const page = () => {
  return (
    <div>
      
      <HeroPage/>
      <ServicesSection/>
      <HowItWorksSection/>
      <SocietyPartnershipSection /> 
      
    </div>
  );
};

export default page;
