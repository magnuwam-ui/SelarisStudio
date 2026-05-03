import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX; 
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      }
      requestAnimationFrame(tick);
    };

    const updateHoverState = () => {
      const hovers = document.querySelectorAll('a, button, .faq-item, .service-card, .bento-card, .work, input, textarea');
      hovers.forEach(el => {
        el.addEventListener('mouseenter', () => setIsHovered(true));
        el.addEventListener('mouseleave', () => setIsHovered(false));
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    const animId = requestAnimationFrame(tick);
    updateHoverState();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div 
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference rounded-full border border-pink-1 transition-[width,height,background,border-color] duration-250 ease-in-out ${isHovered ? 'w-[64px] h-[64px] bg-pink-1/5 border-pink-1 shadow-[0_0_20px_rgba(255,0,127,0.4)]' : 'w-[40px] h-[40px]'}`}
      />
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference w-[6px] h-[6px] bg-white rounded-full translate-x-[-50%] translate-y-[-50%]"
      />
    </>
  );
}
