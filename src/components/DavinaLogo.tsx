import { motion, type Variants } from 'framer-motion';
import logoImage from '../assets/WhatsApp_Image_2026-03-15_at_5.07.29_PM-removebg-preview.png';

interface DavinaLogoProps {
    variant?: 'nav' | 'hero';
}

export default function DavinaLogo({ variant = 'nav' }: DavinaLogoProps) {
    const isHero = variant === 'hero';

    // Cinematic "Tick" Reveal Animation
    // Starts hidden in the bottom-left, sweeps up to the top-right
    const wipeAnimation: Variants = {
        hidden: { 
            clipPath: "inset(100% 100% 0% 0%)", 
            opacity: 0 
        },
        visible: { 
            clipPath: "inset(0% 0% 0% 0%)", 
            opacity: 1,
            transition: { 
                duration: 1.2, 
                ease: [0.25, 1, 0.5, 1] as const, // Smooth aerospace deceleration
                delay: isHero ? 2.4 : 0.5 // Waits for the 2-second boot screen in App.tsx!
            }
        }
    };

    return (
        <div className={`relative select-none z-50 ${isHero ? 'w-[400px] md:w-[600px] block mx-auto' : 'w-[140px] block'}`}>
            <motion.img
                src={logoImage}
                alt="DAVINA Aerospace"
                variants={wipeAnimation}
                initial="hidden"
                animate="visible"
                className={`w-full h-auto object-contain ${
                    isHero
                        ? 'drop-shadow-[0_0_35px_rgba(34,211,238,0.65)] brightness-110' 
                        : 'drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]' 
                }`}
                draggable={false}
            />
        </div>
    );
}