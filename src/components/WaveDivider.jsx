import React from 'react';

/**
 * WaveDivider Component
 * Reusable wave SVG decorations and section dividers.
 * 
 * Props:
 * - type: 'accent' | 'footer' | 'card' | 'curve' | 'splash' (default: 'accent')
 * - color: custom fill/stroke color override
 * - style: custom style object
 * - className: additional CSS class
 */
export default function WaveDivider({ type = 'accent', color, style = {}, className = '' }) {
    if (type === 'accent') {
        return (
            <div className={`wave-accent-wrapper ${className}`} style={{ display: 'inline-block', marginTop: '8px', ...style }}>
                <svg width="45" height="10" viewBox="0 0 45 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3 C 8 0, 10 6, 16 3 C 22 0, 24 6, 30 3 C 36 0, 38 6, 43 3" stroke={color || "var(--color-accent, #7cc04b)"} strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M2 7 C 8 4, 10 10, 16 7 C 22 4, 24 10, 30 7 C 36 4, 38 10, 43 7" stroke="#ffffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                </svg>
            </div>
        );
    }

    if (type === 'footer') {
        return (
            <div className={`footer-top-wave-container ${className}`} style={style}>
                <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="footer-top-wave-svg">
                    {/* Layer 1: Translucent Blue Wave Accent */}
                    <path
                        d="M0,0 L0,44 C131,44 229,72 360,72 C491,72 589,42 720,42 C851,42 949,72 1080,72 C1211,72 1309,44 1440,44 L1440,0 Z"
                        fill="rgba(56, 189, 248, 0.45)"
                    />
                    {/* Layer 2: Translucent White Wave Froth Accent */}
                    <path
                        d="M0,0 L0,32 C131,32 229,60 360,60 C491,60 589,30 720,30 C851,30 949,60 1080,60 C1211,60 1309,32 1440,32 L1440,0 Z"
                        fill="rgba(255, 255, 255, 0.6)"
                    />
                    {/* Layer 3: Solid White Background Cutout */}
                    <path
                        d="M0,0 L0,20 C131,20 229,48 360,48 C491,48 589,18 720,18 C851,18 949,48 1080,48 C1211,48 1309,20 1440,20 L1440,0 Z"
                        fill={color || "#ffffff"}
                    />
                </svg>
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className={`card-wave-container ${className}`} style={style}>
                <svg viewBox="0 0 120 28" preserveAspectRatio="none" className="card-wave-svg">
                    <path d="M0,15 C30,5 90,25 120,15 L120,28 L0,28 Z" fill={color || "currentColor"} />
                </svg>
            </div>
        );
    }

    if (type === 'curve') {
        return (
            <svg className={`testimonial-curve-divider ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none" fill={color || "#ffffff"} xmlns="http://www.w3.org/2000/svg" style={style}>
                <path d="M 0,0 L 80,0 C 70,30 55,70 40,100 L 0,100 Z" />
            </svg>
        );
    }

    if (type === 'splash') {
        return (
            <div className={`testimonial-splash-bg ${className}`} style={style}>
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0,200 Q 50,150 100,160 T 170,80 Q 185,50 200,60 L 200,200 Z" fill={color || "rgba(186, 226, 255, 0.25)"} />
                    <path d="M 30,120 C 25,100 5,90 20,80 C 35,70 45,95 40,110 Z" fill={color || "rgba(186, 226, 255, 0.2)"} />
                </svg>
            </div>
        );
    }

    if (type === 'login') {
        return (
            <div className={`login-top-bottom-waves ${className}`} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1, ...style }}>
                {/* Tropical Sun Radial Glow & Sunbeams */}
                <div style={{
                    position: 'absolute',
                    top: '-80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '650px',
                    height: '350px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(254, 240, 138, 0.55) 0%, rgba(56, 189, 248, 0.25) 45%, rgba(255, 255, 255, 0) 75%)',
                    pointerEvents: 'none',
                    filter: 'blur(15px)'
                }}></div>

                {/* Sunbeams / Rays SVG */}
                <svg style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '220px', opacity: 0.35, pointerEvents: 'none' }} viewBox="0 0 800 220" fill="none">
                    <polygon points="400,0 200,220 240,220" fill="url(#sunray-grad)" />
                    <polygon points="400,0 320,220 370,220" fill="url(#sunray-grad)" />
                    <polygon points="400,0 430,220 480,220" fill="url(#sunray-grad)" />
                    <polygon points="400,0 560,220 600,220" fill="url(#sunray-grad)" />
                    <defs>
                        <linearGradient id="sunray-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Top Fluffy Cloud Canopy SVG - Multi-layered Rich Clouds */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '180px', pointerEvents: 'none' }}>
                    <svg viewBox="0 0 1440 180" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
                        <defs>
                            <linearGradient id="cloud-canopy-back" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(186, 230, 253, 0.85)" />
                                <stop offset="100%" stopColor="rgba(224, 242, 254, 0.4)" />
                            </linearGradient>
                            <linearGradient id="cloud-canopy-mid" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="70%" stopColor="rgba(240, 249, 255, 0.95)" />
                                <stop offset="100%" stopColor="rgba(186, 230, 253, 0.7)" />
                            </linearGradient>
                            <linearGradient id="cloud-canopy-front" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="85%" stopColor="rgba(255, 255, 255, 0.98)" />
                                <stop offset="100%" stopColor="rgba(224, 242, 254, 0.8)" />
                            </linearGradient>
                            <filter id="cloud-shadow" x="-5%" y="-5%" width="110%" height="120%">
                                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.15" />
                            </filter>
                        </defs>

                        {/* Back Cloud Layer: Soft Cyan Puff Base */}
                        <path
                            d="M0,0 L1440,0 L1440,65 Q1380,125 1300,85 Q1210,145 1120,95 Q1020,155 920,105 Q820,150 720,95 Q620,145 520,90 Q410,150 310,85 Q210,135 110,75 Q40,115 0,55 Z"
                            fill="url(#cloud-canopy-back)"
                        />

                        {/* Mid Cloud Layer with Soft Drop Shadow */}
                        <path
                            d="M0,0 L1440,0 L1440,45 Q1370,110 1280,75 Q1190,130 1090,80 Q990,135 890,85 Q790,125 690,75 Q590,125 490,70 Q380,125 280,65 Q180,110 90,55 Q30,95 0,40 Z"
                            fill="url(#cloud-canopy-mid)"
                            filter="url(#cloud-shadow)"
                        />

                        {/* Front Cloud Layer: Fluffy Rounded Bulges hanging down */}
                        <path
                            d="M0,0 L1440,0 L1440,25 
                               C1410,65 1370,75 1330,45 
                               C1290,85 1230,95 1180,60 
                               C1130,95 1060,110 1000,70 
                               C940,110 870,115 820,75 
                               C770,105 710,115 650,70 
                               C590,105 520,110 460,65 
                               C400,100 330,105 280,60 
                               C230,95 160,95 110,50 
                               C70,80 30,70 0,25 Z"
                            fill="url(#cloud-canopy-front)"
                        />
                    </svg>
                </div>

                {/* Floating Standalone Fluffy Mini Clouds */}
                {/* Left Floating Cloud */}
                <div style={{ position: 'absolute', top: '95px', left: '5%', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(2, 132, 199, 0.15))' }}>
                    <svg width="130" height="55" viewBox="0 0 130 55" fill="none">
                        <path d="M20,45 C10,45 2,37 2,27 C2,17 12,14 20,15 C24,6 36,0 48,5 C58,-2 72,2 80,12 C90,5 104,10 108,20 C118,20 126,28 124,38 C122,46 112,45 105,45 Z" fill="#ffffff" />
                        <path d="M20,45 C10,45 2,37 2,27 C2,17 12,14 20,15 C24,6 36,0 48,5 C58,-2 72,2 80,12 C90,5 104,10 108,20 C118,20 126,28 124,38 C122,46 112,45 105,45 Z" fill="url(#mini-cloud-grad-1)" />
                        <defs>
                            <linearGradient id="mini-cloud-grad-1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#e0f2fe" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Right Floating Cloud */}
                <div style={{ position: 'absolute', top: '85px', right: '6%', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(2, 132, 199, 0.15))' }}>
                    <svg width="150" height="60" viewBox="0 0 150 60" fill="none">
                        <path d="M25,50 C12,50 3,41 3,30 C3,19 14,15 23,17 C27,7 40,0 54,6 C65,-2 80,2 89,13 C100,5 116,11 120,22 C132,22 142,31 140,42 C138,51 126,50 118,50 Z" fill="#ffffff" />
                        <path d="M25,50 C12,50 3,41 3,30 C3,19 14,15 23,17 C27,7 40,0 54,6 C65,-2 80,2 89,13 C100,5 116,11 120,22 C132,22 142,31 140,42 C138,51 126,50 118,50 Z" fill="url(#mini-cloud-grad-1)" />
                    </svg>
                </div>

                {/* Flying Tropical Sea Birds Silhouettes */}
                <div style={{ position: 'absolute', top: '125px', left: '22%', pointerEvents: 'none', opacity: 0.55 }}>
                    <svg width="34" height="16" viewBox="0 0 34 16" fill="none">
                        <path d="M1,12 Q9,2 17,9 Q25,2 33,12 Q24,6 17,13 Q10,6 1,12 Z" fill="#0284c7" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', top: '105px', left: '26%', pointerEvents: 'none', opacity: 0.4 }}>
                    <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                        <path d="M1,9 Q6,1 12,6 Q18,1 23,9 Q17,4 12,9 Q7,4 1,9 Z" fill="#0369a1" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', top: '115px', right: '23%', pointerEvents: 'none', opacity: 0.5 }}>
                    <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                        <path d="M1,10 Q7,1 14,7 Q21,1 27,10 Q20,5 14,10 Q8,5 1,10 Z" fill="#0284c7" />
                    </svg>
                </div>

                {/* Floating Sun Sparkles & Water Droplets */}
                <div style={{ position: 'absolute', top: '140px', left: '15%', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }}></div>
                <div style={{ position: 'absolute', top: '155px', right: '18%', width: '10px', height: '10px', borderRadius: '50%', background: '#fef08a', boxShadow: '0 0 12px #fef08a' }}></div>

                {/* Multi-layered Fluid Bottom Organic Water Waves */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '280px', pointerEvents: 'none' }}>
                    <svg viewBox="0 0 1440 280" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
                        <defs>
                            <linearGradient id="login-wave-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0f2942" />
                                <stop offset="50%" stopColor="#1e3a8a" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                        </defs>

                        {/* Layer 1: Translucent Blue Wave */}
                        <path
                            d="M0,140 C240,200 480,120 720,170 C960,220 1200,150 1440,180 L1440,280 L0,280 Z"
                            fill="rgba(30, 58, 138, 0.35)"
                        ></path>

                        {/* Layer 2: Soft Blue Translucent Wave */}
                        <path
                            d="M0,170 C200,130 440,210 680,160 C920,110 1160,200 1440,150 L1440,280 L0,280 Z"
                            fill="rgba(56, 189, 248, 0.45)"
                        ></path>

                        {/* Layer 3: Primary Organic Solid Wave Body */}
                        <path
                            d="M0,200 C280,160 560,230 840,190 C1120,150 1300,210 1440,180 L1440,280 L0,280 Z"
                            fill="url(#login-wave-body-grad)"
                        ></path>
                    </svg>
                </div>

                {/* Floating Atmospheric Water Bubbles */}
                <div style={{ position: 'absolute', bottom: '80px', left: '5%', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(96, 165, 250, 0.35)', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}></div>
                <div style={{ position: 'absolute', bottom: '150px', left: '11%', width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(147, 197, 253, 0.4)', border: '1px solid rgba(255,255,255,0.8)' }}></div>
                <div style={{ position: 'absolute', bottom: '100px', right: '6%', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.3)', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}></div>
                <div style={{ position: 'absolute', bottom: '190px', right: '14%', width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(191, 219, 254, 0.45)' }}></div>
            </div>
        );
    }

    if (type === 'section-wave') {
        return (
            <div className={`section-top-wave-container ${className}`} style={{ position: 'relative', width: '100%', overflow: 'hidden', pointerEvents: 'none', margin: 0, padding: 0, ...style }}>
                <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '65px', margin: 0 }}>
                    {/* Layer 1: Translucent Blue Wave Accent */}
                    <path
                        d="M0,0 L1440,0 L1440,30 C1280,65 1120,70 960,35 C800,5 640,55 480,30 C320,10 160,60 0,20 Z"
                        fill="rgba(56, 189, 248, 0.25)"
                    />
                    {/* Layer 2: Translucent White Wave Accent */}
                    <path
                        d="M0,0 L1440,0 L1440,18 C1260,50 1100,55 940,25 C780,0 620,40 450,22 C280,8 140,48 0,15 Z"
                        fill="rgba(255, 255, 255, 0.6)"
                    />
                    {/* Layer 3: Solid Cutout Wave Body filling down into section background (#ffffff) */}
                    <path
                        d="M0,0 L1440,0 L1440,10 C1260,40 1100,45 940,18 C780,-5 620,32 450,15 C280,0 140,40 0,10 Z"
                        fill={color || "#ffffff"}
                    />
                </svg>
            </div>
        );
    }

    if (type === 'gallery-cloud') {
        return (
            <div className={`gallery-top-cloud-container ${className}`} style={{ position: 'relative', width: '100%', overflow: 'hidden', pointerEvents: 'none', margin: 0, padding: 0, ...style }}>
                <svg
                    viewBox="0 0 1440 90"
                    preserveAspectRatio="none"
                    style={{ display: 'block', width: '100%', height: '85px', margin: 0 }}
                >
                    <defs>
                        <linearGradient id="g-cloud-back-trans" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(186, 230, 253, 0.65)" />
                            <stop offset="100%" stopColor="rgba(224, 242, 254, 0.2)" />
                        </linearGradient>
                        <filter id="g-cloud-soft-shadow" x="-5%" y="-5%" width="110%" height="120%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.08" />
                        </filter>
                    </defs>

                    {/* Section Top Background matching page background (#ffffff) */}
                    <rect width="1440" height="90" fill={color || "#ffffff"} />

                    {/* Layer 1: Translucent Soft Cyan Cloud Accent */}
                    <path
                        d="M0,0 L1440,0 L1440,35 Q1360,75 1270,50 Q1170,85 1070,55 Q970,95 870,55 Q770,85 670,50 Q570,85 470,45 Q370,80 270,45 Q170,75 70,35 Q25,65 0,25 Z"
                        fill="url(#g-cloud-back-trans)"
                    />

                    {/* Layer 2: Solid White Cloud Cutout filling down into Gallery Section (#ffffff) */}
                    <path
                        d="M0,20 
                           C40,55 90,60 140,30 
                           C190,65 260,70 310,40 
                           C360,70 430,75 480,45 
                           C530,75 600,80 650,50 
                           C700,75 770,80 820,55 
                           C870,80 940,85 990,55 
                           C1040,80 1110,80 1160,50 
                           C1210,75 1280,70 1330,40 
                           C1375,55 1410,50 1440,20 
                           L1440,90 L0,90 Z"
                        fill="#ffffff"
                        filter="url(#g-cloud-soft-shadow)"
                    />
                </svg>
            </div>
        );
    }

    return null;
}
