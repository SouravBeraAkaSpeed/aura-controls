"use client";
import ContactSection from "@/components/ContactSection";
import ExploreSection from "@/components/ExploreSection";
import Footer from "@/components/Footer";
import { GridScan } from "@/components/GridScan";
import HeroSection from "@/components/HeroSection";
import { MediaPipeProvider } from "@/components/MediaPipeProvider";
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
    { label: 'Contact', ariaLabel: 'Get in touch', link: '#contact' }
  ];

  const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' }
  ];

  return (
    <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-white">Loading Your Aura...</div>}>


      <TargetCursor
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />


      <div className="min-h-screen w-full bg-black text-white overflow-x-hidden
        bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] ">

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


        <ContactSection />

        <Footer />


      </div>

    </Suspense>
  );
}
