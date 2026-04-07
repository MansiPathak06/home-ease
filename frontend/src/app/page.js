import React from 'react';
import Navbar from './Navbar';
import HeroPage from './HeroPage';
import ServicesSection from './ServicesSection';
import HowItWorksSection from './HowItWorksSection';
import Footer from './Footer';

const page = () => {
  return (
    <div>
      
      <HeroPage/>
      <ServicesSection/>
      <HowItWorksSection/>
      
    </div>
  );
};

export default page;
