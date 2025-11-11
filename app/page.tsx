"use client";

import ContactSection from "@/components/ContactSection";
import ExploreSection from "@/components/ExploreSection";
import Footer from "@/components/Footer";
import { GridScan } from "@/components/GridScan";
import HeroSection from "@/components/HeroSection";
import { MediaPipeProvider } from "@/components/MediaPipeProvider";
import PricingSection from "@/components/PricingSection";
import SplashCursor from "@/components/SplashCursor";
import StaggeredMenu from "@/components/StaggeredMenu";
import TargetCursor from "@/components/TargetCursor";
import Image from "next/image";
import { Suspense } from "react";

export default function Home() {

  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '#' },
    { label: 'Explore', ariaLabel: 'Learn about it', link: '#explore' },
    { label: 'Pricing', ariaLabel: 'View our pricing', link: '#pricing' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '#contact' },
    { label: 'App', ariaLabel: 'App Dashboard', link: '/dashboard' }
  ];

  const socialItems = [
    { label: 'Youtube', link: 'https://www.youtube.com/@gralius' },
    { label: 'GitHub', link: 'https://github.com/SouravBeraAkaSpeed' },
    { label: 'LinkedIn', link: 'https://www.linkedin.com/in/sourav-bera-/' }
  ];

  return (
    <Suspense fallback={<div className="w-full h-screen  flex items-center justify-center text-white">Loading Your Aura...</div>}>


      <TargetCursor
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />


      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[200px]" />
      </div>


      <div className="min-h-screen w-full text-white overflow-x-hidden overflow-visible z-20
         ">


        <div className="absolute mx-auto inset-0   z-30" style={{ width: '100%', height: '100%' }}>
          <GridScan
            enableWebcam={true}
            enableGyro={true}
            scanDirection="pingpong"
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#392e4e"
            gridScale={0.1}
            scanColor="#FF9FFC"
            scanOpacity={0.4}
            enablePost={true}
            bloomIntensity={0.6}
            chromaticAberration={0.002}
            noiseIntensity={0.01}
          />
        </div>

        <div className="flex flex-col h-screen w-full">

          <StaggeredMenu
            isFixed
            position="right"
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#fff"
            openMenuButtonColor="#fff"
            changeMenuColorOnOpen={true}
            colors={['#B19EEF', '#5227FF']}
            logoUrl="/logo.png"
            accentColor="#ff6b6b"
            onMenuOpen={() => console.log('Menu opened')}
            onMenuClose={() => console.log('Menu closed')}
          />
          <HeroSection />

        </div>

        <MediaPipeProvider>
          <ExploreSection />
        </MediaPipeProvider>

        <PricingSection />


        <ContactSection />

        <Footer />


      </div>

    </Suspense>
  );
}
