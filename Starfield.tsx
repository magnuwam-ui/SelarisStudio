import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Ship {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  goingRight: boolean;
  tilt: number;
}

export default function SpaceshipLayer() {
  const [ships, setShips] = useState<Ship[]>([]);

  useEffect(() => {
    let shipId = 0;

    const spawnShip = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const goingRight = Math.random() < 0.5;
      const startY = 60 + Math.random() * (H * 0.55);
      const endY = startY + (Math.random() * 60 - 30);
      const startX = goingRight ? -80 : W + 80;
      const endX = goingRight ? W + 80 : -80;
      const tilt = ((endY - startY) / Math.abs(endX - startX)) * 18;
      const duration = 6.5 + Math.random() * 4;

      const newShip: Ship = {
        id: shipId++,
        startX,
        startY,
        endX,
        endY,
        duration,
        goingRight,
        tilt: goingRight ? tilt : -tilt
      };

      setShips(prev => [...prev, newShip]);

      setTimeout(() => {
        setShips(prev => prev.filter(s => s.id !== newShip.id));
      }, duration * 1000 + 500);
    };

    const loop = () => {
      const gap = 12000 + Math.random() * 16000;
      const timer = setTimeout(() => {
        if (!document.hidden) spawnShip();
        loop();
      }, gap);
      return timer;
    };

    const initialTimer = setTimeout(() => {
      if (!document.hidden) spawnShip();
      loop();
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-1 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {ships.map(ship => (
          <motion.div
            key={ship.id}
            initial={{ 
              x: ship.startX, 
              y: ship.startY, 
              rotate: ship.tilt,
              opacity: 0 
            }}
            animate={{ 
              x: ship.endX, 
              y: ship.endY,
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: ship.duration, 
              ease: "linear",
              opacity: { times: [0, 0.08, 0.92, 1] }
            }}
            className={`absolute w-9 h-3 flex items-center ${ship.goingRight ? '' : '-scale-x-100'}`}
          >
            {/* Trail */}
            <div className="absolute right-8 top-1 w-6 h-1 bg-gradient-to-l from-orange-1/85 via-pink-1/40 to-transparent rounded-full blur-[1px]" />
            {/* Body */}
            <div className="absolute left-2 top-0.5 w-[22px] h-2 bg-gradient-to-b from-white via-zinc-400 to-zinc-900 rounded-[50%_30%_30%_50%/50%_50%_50%_50%] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.4)]" />
            {/* Cockpit */}
            <div className="absolute left-3.5 top-[3px] w-1.5 h-1 bg-[radial-gradient(circle_at_35%_35%,#FF8000,#FF0080_60%,#3d0012)] rounded-full shadow-[0_0_6px_rgba(255,128,0,0.9)]" />
            {/* Fin */}
            <div className="absolute right-1.5 top-0 w-2 h-3 bg-gradient-to-br from-pink-1 to-pink-deep [clip-path:polygon(0_50%,100%_0,100%_100%)]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
