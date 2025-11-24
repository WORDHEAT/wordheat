
import React, { useRef, useEffect } from 'react';
import { Temperature } from '../types';

interface TemperatureBackgroundProps {
  temperature: Temperature;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const TemperatureBackground: React.FC<TemperatureBackgroundProps> = ({ temperature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  // Configuration based on temperature
  const getConfig = (temp: Temperature) => {
    switch (temp) {
      case Temperature.BURNING:
        return { count: 80, speedY: -2.5, color: '255, 80, 0', dir: 'up', size: 4 }; // Fast rising fire
      case Temperature.HOT:
        return { count: 60, speedY: -1.5, color: '255, 140, 0', dir: 'up', size: 3 }; // Rising embers
      case Temperature.WARM:
        return { count: 40, speedY: -0.8, color: '255, 200, 50', dir: 'up', size: 2 }; // Slow sparks
      case Temperature.COLD:
        return { count: 40, speedY: 0.5, color: '150, 200, 255', dir: 'down', size: 2 }; // Light mist
      case Temperature.FREEZING:
        return { count: 50, speedY: 1.2, color: '200, 230, 255', dir: 'down', size: 2.5 }; // Snow
      case Temperature.SOLVED:
        return { count: 100, speedY: -1, color: '255, 215, 0', dir: 'up', size: 3 }; // Golden aura
      default:
        return { count: 20, speedY: 0.2, color: '255, 255, 255', dir: 'down', size: 1 };
    }
  };

  const initParticle = (width: number, height: number, config: any): Particle => {
    const isUp = config.dir === 'up';
    return {
      x: Math.random() * width,
      y: isUp ? height + Math.random() * 20 : -Math.random() * 20,
      size: Math.random() * config.size + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: config.speedY * (Math.random() * 0.5 + 0.8), // Variance in speed
      opacity: Math.random() * 0.5 + 0.1,
      life: 0,
      maxLife: Math.random() * 100 + 100
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = getConfig(temperature);
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize particles if empty or count changed drastically
    if (particlesRef.current.length === 0 || Math.abs(particlesRef.current.length - config.count) > 20) {
       particlesRef.current = Array.from({ length: config.count }, () => 
         initParticle(canvas.width, canvas.height, config)
       );
       // Pre-warm the simulation so particles are already on screen
       particlesRef.current.forEach(p => {
         p.y = Math.random() * canvas.height;
       });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      const currentConfig = getConfig(temperature); // Get fresh config in loop
      
      // Adjust particle count dynamically
      if (particlesRef.current.length < currentConfig.count) {
         particlesRef.current.push(initParticle(canvas.width, canvas.height, currentConfig));
      } else if (particlesRef.current.length > currentConfig.count) {
         particlesRef.current.pop();
      }

      particlesRef.current.forEach((p, i) => {
        // Movement
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;

        // Wrap around or Reset
        const isUp = currentConfig.dir === 'up';
        const isDead = p.life > p.maxLife;
        const isOutY = isUp ? p.y < -50 : p.y > canvas.height + 50;
        const isOutX = p.x < -50 || p.x > canvas.width + 50;

        if (isDead || isOutY || isOutX) {
          particlesRef.current[i] = initParticle(canvas.width, canvas.height, currentConfig);
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentConfig.color}, ${p.opacity})`;
        ctx.fill();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [temperature]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }} // Global opacity for subtlety
    />
  );
};
