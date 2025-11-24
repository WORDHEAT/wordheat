
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Flame, Brain, Globe, Users, Zap, ChevronRight, Mail, Heart, ChevronDown, Sparkles, Palette, HelpCircle, ArrowRight, ArrowDown } from 'lucide-react';
import { LegalModal } from '../components/LegalModal';
import { Icon } from '../components/Icon';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { profile, openAuthModal } = useUser();
  const [legalModal, setLegalModal] = useState<{isOpen: boolean, type: 'privacy' | 'terms'}>({
    isOpen: false,
    type: 'privacy'
  });
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse for subtle parallax on gradients
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate random bokeh particles for the hero background with Hot/Cold theme
  // REDUCED COUNT to 15 for a cleaner look
  const hazeParticles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const isHot = Math.random() > 0.5;
      // Explicit "Hot" (Red/Orange/Yellow) and "Cold" (Blue/Cyan/Purple) palettes
      const colorClass = isHot 
        ? ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-rose-500'][Math.floor(Math.random() * 4)]
        : ['bg-blue-500', 'bg-cyan-400', 'bg-indigo-500', 'bg-violet-500'][Math.floor(Math.random() * 4)];

      // Choose animation speed
      const animationClass = ['animate-wander', 'animate-wander-slow', 'animate-wander-fast'][Math.floor(Math.random() * 3)];
      
      // Reduced blur for distinct "bokeh" circles
      const blurClass = Math.random() > 0.6 ? 'blur-md' : (Math.random() > 0.3 ? 'blur-sm' : 'blur-[1px]');

      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 100 + 30, // Larger size to compensate for fewer particles
        opacity: Math.random() * 0.25 + 0.05, // Lower opacity for subtlety
        color: colorClass,
        blur: blurClass,
        animation: animationClass,
        delay: Math.random() * -20 // Negative delay to start animation mid-cycle
      };
    });
  }, []);

  const openLegal = (type: 'privacy' | 'terms') => {
    setLegalModal({ isOpen: true, type });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Navbar height + padding
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const faqs = [
    { 
      q: "How is this different from Wordle?", 
      a: "Wordle checks for correct letters and positions (spelling). WordHeat checks for meaning (semantics). You can guess 'Ocean' when the target is 'Sea' and get a high score, even though they share no letters!" 
    },
    { 
      q: "How does the AI scoring work?", 
      a: "We use Google's Gemini API to analyze the 'semantic distance' between your guess and the secret word. Imagine a 3D map of all words—we measure how close they are in concept." 
    },
    { 
      q: "Is the game free?", 
      a: "Yes! WordHeat is free to play. You earn virtual coins by winning games, which you can use to unlock themes or get hints. No real money is required." 
    },
    { 
      q: "Can I play with friends?", 
      a: "Absolutely. Use the 'Challenge' button on the home screen to generate a custom link, or use 'Party Mode' to play locally on a single device with a group." 
    }
  ];

  const team = [
    { name: "Alex Dev", role: "Lead Developer", icon: "Brain", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { name: "Sam Design", role: "UI/UX Designer", icon: "Palette", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { name: "Jordan AI", role: "Prompt Engineer", icon: "Bot", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { name: "Casey QA", role: "Community Manager", icon: "Heart", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500/30 scroll-smooth overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform border border-orange-400/20">
              <Flame size={24} fill="white" className="text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">WordHeat</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {['Features', 'About', 'Team', 'Support'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="hover:text-white transition-colors hover:scale-105 transform relative group px-2 py-1"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => profile.username ? navigate('/home') : openAuthModal()}
            className="group relative px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-bold transition-all border border-slate-700 shadow-lg overflow-hidden flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              {profile.username ? 'Open App' : 'Login'}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center pt-32 pb-20 md:pt-40 px-6 overflow-hidden">
        
        {/* ENHANCED BACKGROUND SYSTEM */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
           {/* Base Grid Pattern with Perspective */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
           
           {/* Primary Warm Glow (Parallax) */}
           <div 
             className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140vw] h-[800px] bg-gradient-to-b from-orange-600/20 via-red-600/10 to-transparent blur-[120px] rounded-[100%] mix-blend-screen animate-pulse-slow"
             style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px) translateX(-50%)` }}
           ></div>
           
           {/* Secondary Cool Orb (Left) */}
           <div 
             className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen animate-float"
             style={{ 
               animationDuration: '12s',
               transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
             }}
           ></div>

           {/* Secondary Cool Orb (Right) */}
           <div 
             className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen animate-float"
             style={{ 
               animationDuration: '15s', 
               animationDelay: '2s',
               transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`
             }}
           ></div>
           
           {/* Accent Highlight */}
           <div 
             className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-rose-500/10 blur-[100px] rounded-full animate-pulse"
             style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }}
           ></div>

           {/* Dynamic Hot/Cold Bokeh Particles */}
           {hazeParticles.map((p) => (
             <div 
               key={p.id}
               className={`absolute rounded-full mix-blend-screen ${p.color} ${p.blur} ${p.animation}`}
               style={{
                 left: `${p.left}%`,
                 top: `${p.top}%`,
                 width: `${p.size}px`,
                 height: `${p.size}px`,
                 opacity: p.opacity,
                 animationDelay: `${p.delay}s`,
               }}
             ></div>
           ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 animate-pop">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/50 border border-white/10 text-xs font-bold text-orange-400 mb-10 backdrop-blur-xl shadow-2xl hover:scale-105 transition-transform cursor-default ring-1 ring-orange-500/20">
            <Zap size={14} fill="currentColor" />
            <span className="tracking-wide">The #1 Semantic Puzzle Game</span>
          </div>
          
          {/* Hero Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] drop-shadow-2xl select-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 filter drop-shadow-lg">
              Guess Meanings,
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-rose-500 animate-gradient-x pb-2 filter drop-shadow-lg">
              Not Spellings.
            </span>
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Dive into a world where <span className="text-white font-bold relative">words<span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500/50"></span></span> are connected by <span className="text-white font-bold relative">ideas<span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500/50"></span></span>. <br className="hidden md:block" />
            Powered by Google Gemini.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={() => navigate('/home')}
              className="group relative w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xl rounded-2xl shadow-[0_0_50px_-10px_rgba(239,68,68,0.5)] transition-all transform hover:scale-[1.02] hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden ring-1 ring-white/20"
            >
              <span className="relative z-10 flex items-center gap-2 text-shadow">Play Now <ChevronRight size={24} strokeWidth={3} /></span>
              {/* Shine Animation */}
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
            </button>
            
            <button 
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-12 py-6 bg-slate-900/50 hover:bg-slate-800/60 text-white font-bold text-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center backdrop-blur-md shadow-xl hover:shadow-2xl"
            >
              Learn More
            </button>
          </div>

          {/* Stats/Social Proof - Glass Container */}
          <div className="mt-24 inline-flex flex-wrap items-center justify-center gap-8 sm:gap-12 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-3xl px-10 py-6 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-300 text-xs font-bold uppercase tracking-widest">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20"><Globe size={18} /></div> 5+ Languages
            </div>
            <div className="w-px h-8 bg-white/5 hidden sm:block"></div>
            <div className="flex items-center gap-3 text-slate-300 text-xs font-bold uppercase tracking-widest">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20"><Users size={18} /></div> Multiplayer
            </div>
            <div className="w-px h-8 bg-white/5 hidden sm:block"></div>
            <div className="flex items-center gap-3 text-slate-300 text-xs font-bold uppercase tracking-widest">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20"><Brain size={18} /></div> Gemini AI
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-bounce text-slate-400 opacity-80">
           <ArrowDown size={28} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-slate-900/20 border-y border-white/5 relative backdrop-blur-sm overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Why WordHeat?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">Unlike traditional word games, we use semantic vector space to calculate how close your meaning is to the target.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain size={32} className="text-purple-400" />}
              title="AI Intelligence"
              description="Our engine understands context, synonyms, and loose associations, giving you a 'Temperature' score for every guess."
              delay={0}
              color="purple"
            />
            <FeatureCard 
              icon={<Users size={32} className="text-blue-400" />}
              title="Social Play"
              description="Challenge friends with custom links, play locally in Party Mode, or climb the global leaderboards."
              delay={100}
              color="blue"
            />
            <FeatureCard 
              icon={<Globe size={32} className="text-emerald-400" />}
              title="Multilingual"
              description="Play seamlessly in English, Spanish, French, German, and more. The perfect way to practice new vocabulary."
              delay={200}
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
           <div className="flex flex-col lg:flex-row items-center gap-20">
             <div className="flex-1 space-y-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>Under the Hood</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1]">
                  Powered by <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Semantic Vectors</span>
                </h2>
                <div className="space-y-6">
                  <p className="text-slate-300 text-xl leading-relaxed font-light">
                    Most word games are about spelling. WordHeat is about <strong>concepts</strong>.
                  </p>
                  <p className="text-slate-400 leading-relaxed text-lg">
                    When you guess a word, we convert it into a high-dimensional vector. We then calculate the cosine similarity between your guess and the secret word. This "Semantic Distance" becomes your temperature score.
                  </p>
                </div>
                
                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-6 p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
                    <div className="text-right w-24 font-bold text-white text-sm uppercase tracking-wider opacity-70">Secret</div>
                    <ArrowRight size={20} className="text-slate-600" />
                    <div className="font-black text-3xl text-white tracking-widest">KING</div>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 transition-colors">
                     <div className="text-right w-24 font-bold text-emerald-400 text-lg">Queen</div>
                     <ArrowRight size={20} className="text-slate-600" />
                     <div className="flex items-center gap-4 flex-1">
                       <div className="h-3 w-full max-w-[160px] bg-emerald-900/30 rounded-full overflow-hidden">
                         <div className="h-full w-[95%] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
                       </div>
                       <span className="text-emerald-400 font-bold text-base whitespace-nowrap">95 (Burning)</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-orange-500/30 transition-colors">
                     <div className="text-right w-24 font-bold text-orange-400 text-lg">Crown</div>
                     <ArrowRight size={20} className="text-slate-600" />
                     <div className="flex items-center gap-4 flex-1">
                       <div className="h-3 w-full max-w-[160px] bg-orange-900/30 rounded-full overflow-hidden">
                         <div className="h-full w-[75%] bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
                       </div>
                       <span className="text-orange-400 font-bold text-base whitespace-nowrap">75 (Hot)</span>
                     </div>
                  </div>
                </div>
             </div>
             
             {/* Code Card */}
             <div className="flex-1 relative w-full flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="w-full max-w-md relative z-10 group perspective-1000">
                   <div className="relative bg-[#0d1117] border border-slate-700/80 rounded-xl shadow-2xl 
                                   overflow-hidden shadow-indigo-500/20 
                                   animate-idle-rotate 
                                   group-hover:animate-none group-hover:rotate-0 group-hover:scale-105 group-hover:shadow-indigo-500/40
                                   transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.1,0.25,1.0)] origin-center ring-1 ring-white/5">
                      
                      {/* Terminal Header */}
                      <div className="bg-[#161b22] px-4 py-3 flex items-center gap-3 border-b border-slate-800/80">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div className="flex-1 text-center text-[11px] font-mono text-slate-500 opacity-70">semantic_engine.ts</div>
                        <div className="w-10"></div> 
                      </div>

                      <div className="p-6 font-mono text-sm leading-7 bg-[#0d1117]/90 backdrop-blur-sm select-none flex">
                          {/* Line Numbers */}
                          <div className="text-slate-700 text-right pr-4 select-none border-r border-slate-800/50 mr-4">
                            <div>1</div>
                            <div>2</div>
                            <div>3</div>
                            <div>4</div>
                            <div>5</div>
                            <div>6</div>
                            <div>7</div>
                          </div>

                          {/* Code */}
                          <div className="flex-1">
                            <div className="flex gap-2">
                                <span className="text-[#ff7b72]">const</span>
                                <span className="text-[#d2a8ff]">target</span>
                                <span className="text-[#79c0ff]">=</span>
                                <span className="text-[#a5d6ff]">"king"</span>;
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[#ff7b72]">const</span>
                                <span className="text-[#d2a8ff]">guess</span>
                                <span className="text-[#79c0ff]">=</span>
                                <span className="text-[#a5d6ff]">"queen"</span>;
                            </div>
                            <div className="h-4"></div>
                            <div className="text-slate-500 italic">
                                // Cosine similarity in vector space
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[#ff7b72]">let</span>
                                <span className="text-[#d2a8ff]">sim</span>
                                <span className="text-[#79c0ff]">=</span>
                                <span className="text-[#f0883e]">calcDist</span>(target, guess);
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-400">console</span>.<span className="text-[#d2a8ff]">log</span>(sim); <span className="text-emerald-500 opacity-0 animate-pulse" style={{animationDelay: '1.5s', animationFillMode: 'forwards'}}>// 0.95</span>
                            </div>
                            <div className="mt-2 flex gap-1">
                                <span className="text-emerald-500">➜</span>
                                <span className="text-[#79c0ff]">~</span>
                                <span className="animate-pulse w-2 h-5 bg-slate-500 inline-block align-middle ml-1"></span>
                            </div>
                          </div>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-32 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
           <div className="text-center mb-20">
             <h2 className="text-4xl font-bold text-white mb-4">Meet the Team</h2>
             <p className="text-slate-400 text-lg">The puzzle enthusiasts behind the pixels.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {team.map((member, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl flex flex-col items-center text-center hover:bg-slate-800 hover:-translate-y-2 transition-all duration-500 group shadow-lg hover:shadow-2xl backdrop-blur-sm relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   
                   <div className={`w-24 h-24 rounded-3xl mb-6 flex items-center justify-center shadow-inner border ${member.border} ${member.bg} ${member.color} group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                      <Icon name={member.icon} size={36} strokeWidth={1.5} />
                   </div>
                   
                   <h4 className="font-bold text-white text-lg mb-2 relative z-10">{member.name}</h4>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest group-hover:text-white/70 transition-colors relative z-10">{member.role}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Support / FAQ Section */}
      <section id="support" className="py-32 px-6 relative overflow-hidden">
         <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-16">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 mb-6">
                  <HelpCircle size={12} />
                  <span>FAQ & Support</span>
               </div>
               <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
               <p className="text-slate-400 text-lg">Everything you need to know about WordHeat.</p>
            </div>

            <div className="space-y-4 mb-20">
              {faqs.map((faq, index) => (
                <div key={index} className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-slate-600 hover:bg-slate-900/60">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-200 text-lg group-hover:text-white transition-colors">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-300 ${openFaq === index ? 'rotate-180 bg-slate-700 text-white' : 'text-slate-500'}`}>
                       <ChevronDown size={18} />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 pt-0 text-slate-400 text-base leading-relaxed border-t border-white/5 mt-2">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="group bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-10 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-orange-500/10 transition-colors duration-700"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700"></div>
               
               <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Still have questions?</h3>
               <p className="text-slate-400 mb-10 max-w-lg mx-auto relative z-10 leading-relaxed text-lg">
                 Our support team is always ready to help you with bugs, feature requests, or feedback. We reply within 24 hours.
               </p>
               <a 
                 href="mailto:support@wordheat.app" 
                 className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg relative z-10 group/btn"
               >
                 <Mail size={20} className="group-hover/btn:animate-bounce" /> Contact Support
               </a>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-center text-sm text-slate-600 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
               <Flame size={16} className="text-orange-500" fill="currentColor" />
             </div>
             <span className="font-bold text-slate-300 text-lg">WordHeat</span>
           </div>
           
           <div className="flex flex-wrap justify-center gap-8 font-medium">
             <button onClick={() => openLegal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
             <button onClick={() => openLegal('terms')} className="hover:text-white transition-colors">Terms of Service</button>
             <a href="#" className="hover:text-white transition-colors">Press Kit</a>
           </div>

           <div className="flex items-center gap-2 opacity-60">
             <span>&copy; {new Date().getFullYear()} WordHeat</span>
             <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
             <div className="flex items-center gap-1">
               <span>Made with</span>
               <Heart size={12} className="text-red-600 fill-red-600 animate-pulse" /> 
             </div>
           </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))} 
        type={legalModal.type} 
      />
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay, color }: { icon: React.ReactNode, title: string, description: string, delay: number, color: string }) => (
  <div 
    className={`p-8 bg-slate-900/40 border border-white/5 rounded-3xl hover:bg-slate-800/60 transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-${color}-500/10 backdrop-blur-sm relative overflow-hidden`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-${color}-500/20 transition-colors duration-500`}></div>

    <div className="mb-8 p-4 bg-slate-900 rounded-2xl w-fit border border-slate-800 group-hover:border-slate-700 transition-all shadow-lg group-hover:scale-110 duration-300 relative z-10">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-base relative z-10">
      {description}
    </p>
  </div>
);

export default Landing;
