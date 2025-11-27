import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const BookShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // ROTATION LOGIC
  const rotateY = useTransform(smoothProgress, [0, 0.2, 0.5, 0.8, 1], [0, 60, -20, 30, 0]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [0, 5, 0]);
  const translateZ = useTransform(smoothProgress, [0, 0.5, 1], [0, 100, 0]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.1, 1]);

  // COVER OPENING LOGIC
  // Opens to -160 degrees for a realistic read angle
  const coverRotateY = useTransform(smoothProgress, [0.15, 0.35, 0.65, 0.85], [0, -160, -160, 0]);

  // TEXT FADE LOGIC
  const phase1 = useTransform(smoothProgress, [0.1, 0.2, 0.3], [0, 1, 0]);
  const phase2 = useTransform(smoothProgress, [0.4, 0.5, 0.6], [0, 1, 0]);
  const phase3 = useTransform(smoothProgress, [0.7, 0.8, 0.9], [0, 1, 0]);

  // DIMENSIONS
  const width = 260;
  const height = 380;
  const depth = 50; // Total spine thickness
  const boardThickness = 4; // Hardcover thickness
  
  // Page Block Dimensions
  const pageWidth = width - 10;
  const pageHeight = height - 10;
  const pageDepth = depth - (boardThickness * 2) - 2; // Subtract covers + slight gap

  return (
    <div id="showcase" ref={containerRef} className="h-[400vh] bg-[#FDFBF7] relative perspective-1000">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col perspective-1000">
        
        {/* Header Text */}
        <div className="flex-none pt-24 pb-8 md:pt-32 md:pb-12 text-center z-20 px-4 relative pointer-events-none">
            <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}>
                <h2 className="font-serif text-3xl md:text-5xl text-slate-800 mb-3">
                The Anatomy of a <span className="italic text-amber-700">Masterpiece</span>
                </h2>
                <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">
                    Scroll down to explore the craftsmanship behind our collection.
                </p>
            </motion.div>
        </div>

        {/* 3D Stage */}
        <div className="flex-grow w-full relative flex items-center justify-center perspective-1000">
            
            {/* Background Orbs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[100px] translate-x-32 -translate-y-20" />
                <div className="w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] -translate-x-32 translate-y-20" />
            </div>

            {/* Annotations/Lines */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path d="M 50 50 C 40 50, 35 40, 25 35" fill="none" stroke="#b45309" strokeWidth="0.2" strokeDasharray="1 1" style={{ pathLength: phase1, opacity: phase1 }} />
                <motion.circle cx="25" cy="35" r="0.4" fill="#b45309" style={{ opacity: phase1 }} />

                <motion.path d="M 50 50 L 75 50" fill="none" stroke="#b45309" strokeWidth="0.2" strokeDasharray="1 1" style={{ pathLength: phase2, opacity: phase2 }} />
                <motion.circle cx="75" cy="50" r="0.4" fill="#b45309" style={{ opacity: phase2 }} />

                <motion.path d="M 50 50 C 40 50, 40 70, 30 75" fill="none" stroke="#b45309" strokeWidth="0.2" strokeDasharray="1 1" style={{ pathLength: phase3, opacity: phase3 }} />
                <motion.circle cx="30" cy="75" r="0.4" fill="#b45309" style={{ opacity: phase3 }} />
            </svg>

            {/* Feature Cards */}
            <motion.div className="absolute top-[30%] left-[10%] w-64 z-20 pointer-events-none" style={{ opacity: phase1, x: -20 }}>
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="font-serif font-bold text-slate-900 text-lg">Premium Hardcover</h3>
                    <p className="text-xs text-slate-600">Linen-textured finish with gold foil embossing.</p>
                </div>
            </motion.div>
             <motion.div className="absolute top-[45%] right-[10%] w-64 z-20 pointer-events-none" style={{ opacity: phase2, x: 20 }}>
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="font-serif font-bold text-slate-900 text-lg">Acid-Free Paper</h3>
                    <p className="text-xs text-slate-600">90gsm Munken cream paper preventing yellowing.</p>
                </div>
            </motion.div>
             <motion.div className="absolute top-[70%] left-[15%] w-64 z-20 pointer-events-none" style={{ opacity: phase3, y: 20 }}>
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="font-serif font-bold text-slate-900 text-lg">Smyth-Sewn Binding</h3>
                    <p className="text-xs text-slate-600">Lay-flat binding for superior durability.</p>
                </div>
            </motion.div>

            {/* ============ THE BOOK ============ */}
            <motion.div
                className="relative preserve-3d"
                style={{
                    width: width,
                    height: height,
                    rotateY,
                    rotateX,
                    z: translateZ,
                    scale
                }}
            >
                {/* 1. BACK COVER ASSEMBLY (Static relative to book frame) */}
                <div className="absolute inset-0 preserve-3d" style={{ transform: `translateZ(${-depth/2}px)` }}>
                    
                    {/* Outer Face */}
                    <div className="absolute inset-0 bg-[#2c241b] backface-hidden rounded-sm" style={{ transform: 'rotateY(180deg)' }}>
                         <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }}></div>
                    </div>
                    
                    {/* Inner Face */}
                    <div className="absolute inset-0 bg-[#fdfbf7] backface-hidden rounded-sm" style={{ transform: `translateZ(${boardThickness}px)` }}>
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                    </div>

                    {/* Thickness Edges */}
                    <div className="absolute right-0 top-0 bottom-0 bg-[#1a1510]" style={{ width: boardThickness, transform: `rotateY(90deg) translateZ(${boardThickness/2}px) translateX(${boardThickness/2}px)` }}></div>
                    <div className="absolute top-0 left-0 right-0 bg-[#1a1510]" style={{ height: boardThickness, transform: `rotateX(90deg) translateZ(${boardThickness/2}px) translateY(-${boardThickness/2}px)` }}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-[#1a1510]" style={{ height: boardThickness, transform: `rotateX(-90deg) translateZ(${boardThickness/2}px) translateY(${boardThickness/2}px)` }}></div>
                </div>

                {/* 2. PAGE BLOCK (Sitting on Back Inner Face) */}
                <div className="absolute preserve-3d" 
                     style={{
                         width: pageWidth,
                         height: pageHeight,
                         left: (width - pageWidth) / 2 + 3, // Slightly offset from spine
                         top: (height - pageHeight) / 2,
                         transform: `translateZ(${-depth/2 + boardThickness}px)`
                     }}>
                    
                    {/* Top of Pages */}
                    <div className="absolute top-0 left-0 right-0 bg-[#f1f5f9]" 
                         style={{ 
                             height: pageDepth, 
                             transform: `rotateX(90deg) translateZ(${pageDepth/2}px)`,
                             backgroundImage: 'repeating-linear-gradient(to right, #e2e8f0 0px, #f8fafc 1px, #f1f5f9 2px)'
                         }}></div>
                    
                    {/* Right Edge of Pages */}
                    <div className="absolute right-0 top-0 bottom-0 bg-[#f1f5f9]" 
                         style={{ 
                             width: pageDepth, 
                             transform: `rotateY(90deg) translateZ(${pageDepth/2}px)`,
                             backgroundImage: 'repeating-linear-gradient(to right, #e2e8f0 0px, #f8fafc 1px, #f1f5f9 2px)'
                         }}></div>

                    {/* Bottom of Pages */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#f1f5f9]" 
                         style={{ 
                             height: pageDepth, 
                             transform: `rotateX(-90deg) translateZ(${pageDepth/2}px)`,
                             backgroundImage: 'repeating-linear-gradient(to right, #e2e8f0 0px, #f8fafc 1px, #f1f5f9 2px)'
                         }}></div>

                    {/* Page Surface (Prologue) */}
                    <div className="absolute inset-0 bg-[#FFFDF5] backface-hidden" style={{ transform: `translateZ(${pageDepth}px)` }}>
                         {/* Content */}
                         <div className="w-full h-full p-6 relative overflow-hidden">
                             {/* Paper Texture */}
                             <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                             {/* Gutter Shadow */}
                             <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 to-transparent z-10"></div>
                             
                             <div className="border border-slate-200 h-full p-4 relative z-0 opacity-80">
                                 <h4 className="font-serif text-center italic text-slate-800 text-lg mt-4 mb-6">Prologue</h4>
                                 <div className="space-y-3">
                                     {[...Array(8)].map((_, i) => (
                                         <div key={i} className="h-1 bg-slate-400 rounded-full opacity-20" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                                     ))}
                                 </div>
                                 <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-400 font-serif">1</div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* 3. SPINE (Connecting Back and Front) */}
                <div className="absolute left-0 top-0 bottom-0 bg-[#2c241b] backface-hidden flex items-center justify-center"
                     style={{
                         width: depth,
                         transform: `translateX(-${depth/2}px) rotateY(-90deg)`,
                         // This places it in the center of the book volume (Z=0), facing left.
                     }}>
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }}></div>
                    <span className="text-[#e2c792] font-serif text-sm tracking-[0.4em] font-bold rotate-90 whitespace-nowrap uppercase">BukuCerdas</span>
                    {/* Spine Ridges */}
                    <div className="absolute top-10 w-full h-0.5 bg-white/20 blur-[0.5px]"></div>
                    <div className="absolute bottom-10 w-full h-0.5 bg-white/20 blur-[0.5px]"></div>
                </div>

                {/* 4. FRONT COVER ASSEMBLY (Hinged) */}
                <motion.div
                    className="absolute inset-0 preserve-3d"
                    style={{
                        transformOrigin: '0% 50%', // Hinge at left edge
                        rotateY: coverRotateY,
                        z: depth/2 // Start at front
                    }}
                >
                     {/* Outer Face */}
                     <div className="absolute inset-0 bg-[#2c241b] backface-hidden rounded-r-sm"
                          style={{ transform: `translateZ(${boardThickness}px)` }}>
                         <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }}></div>
                         <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 grayscale brightness-75 contrast-125" alt="Cover" />
                         
                         {/* Typography Overlay */}
                         <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 border-l-[1px] border-white/5">
                            <div className="border border-[#e2c792]/50 p-6 bg-black/40 backdrop-blur-[1px]">
                                <h1 className="font-serif text-4xl text-[#e2c792] tracking-widest uppercase font-bold text-center leading-tight">Milk<br/>And<br/>Honey</h1>
                            </div>
                         </div>

                         {/* Hinge Detail */}
                         <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/60 to-transparent"></div>
                     </div>

                     {/* Inner Face */}
                     <div className="absolute inset-0 bg-[#fdfbf7] backface-hidden"
                          style={{ transform: 'rotateY(180deg)' }}>
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                         {/* Hinge Crease Shadow */}
                         <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
                         
                         {/* Library Stamp */}
                         <div className="absolute bottom-8 left-0 right-0 text-center opacity-50">
                             <div className="w-16 h-16 border border-slate-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                                 <span className="font-serif italic text-slate-800">Ex Libris</span>
                             </div>
                         </div>
                     </div>

                     {/* Thickness Edges */}
                     <div className="absolute right-0 top-0 bottom-0 bg-[#1a1510]" style={{ width: boardThickness, transform: `rotateY(90deg) translateZ(${boardThickness/2}px) translateX(${boardThickness/2}px)` }}></div>
                     <div className="absolute top-0 left-0 right-0 bg-[#1a1510]" style={{ height: boardThickness, transform: `rotateX(90deg) translateZ(${boardThickness/2}px) translateY(-${boardThickness/2}px)` }}></div>
                     <div className="absolute bottom-0 left-0 right-0 bg-[#1a1510]" style={{ height: boardThickness, transform: `rotateX(-90deg) translateZ(${boardThickness/2}px) translateY(${boardThickness/2}px)` }}></div>
                </motion.div>

            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookShowcase;