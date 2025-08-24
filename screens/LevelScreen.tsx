import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Level, Unit } from '../types.ts';
import CheckCircleIcon from '../components/icons/CheckCircleIcon.tsx';
import ChevronRightIcon from '../components/icons/ChevronRightIcon.tsx';
import LockIcon from '../components/icons/LockIcon.tsx';
import StarIcon from '../components/icons/StarIcon.tsx';
import { playSound } from '../utils/sounds.ts';
import PathConnector from '../components/PathConnector.tsx';

// Define the Point type as it's used by PathConnector
interface Point {
  x: number; // percentage
  y: number; // pixels
}

interface LevelScreenProps {
  level: Level;
  onSelectUnit: (unitId: number) => void;
  onBack: () => void;
  isUnitCompleted: (unit: Unit) => boolean;
  isAdmin: boolean;
}

const UnitNode: React.FC<{ 
  unit: Unit; 
  onClick: () => void; 
  isUnlocked: boolean, 
  isCompleted: boolean,
  setRef: (el: HTMLDivElement | null) => void;
}> = ({ unit, onClick, isUnlocked, isCompleted, setRef }) => {
  const isClickable = isUnlocked || isCompleted;

  return (
    <div
      ref={setRef}
      onClick={isClickable ? onClick : undefined}
      className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 transform 
        ${isClickable ? 'cursor-pointer bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1 border-2 border-slate-700 hover:border-gold-royal' : 'bg-slate-800/50 border-2 border-slate-700 opacity-60'}
      `}
    >
      <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center
        ${!isUnlocked && !isCompleted ? 'bg-slate-700 border-slate-600' 
          : isCompleted ? 'bg-slate-700 border-gold-royal' 
          : 'bg-slate-700 border-slate-600'}
      `}>
        {isUnlocked || isCompleted ? (
          isCompleted ? <CheckCircleIcon className="w-10 h-10 text-yellow-400" /> : <StarIcon className="w-9 h-9 text-yellow-500" />
        ) : (
          <LockIcon className="w-8 h-8 text-slate-500" />
        )}
      </div>
      <div className="flex-grow">
        <p className={`text-sm font-semibold ${isClickable ? 'text-gold-royal' : 'text-slate-500'}`}>الوحدة {unit.unit_id}</p>
        <h3 className={`text-lg font-bold leading-tight ${isClickable ? 'text-slate-100' : 'text-slate-400'}`}>
          {unit.title}
        </h3>
      </div>
      {isClickable && <ChevronRightIcon className="w-6 h-6 text-slate-400 transform -scale-x-100" />}
    </div>
  );
};

const LevelScreen: React.FC<LevelScreenProps> = ({ level, onSelectUnit, onBack, isUnitCompleted, isAdmin }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [nodePoints, setNodePoints] = useState<Point[]>([]);

  const calculatePoints = useCallback(() => {
    if (!containerRef.current || nodeRefs.current.size < 2) {
      setNodePoints([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const newPoints: Point[] = [];

    const sortedUnits = [...level.units].sort((a, b) => a.unit_id - b.unit_id);

    sortedUnits.forEach((unit, index) => {
      const el = nodeRefs.current.get(unit.unit_id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Since the UI is RTL, the icon is on the right. We create a zig-zag path on the right side.
        const x = index % 2 === 0 ? 93 : 97;
        const y = rect.top - containerRect.top + rect.height / 2;
        newPoints.push({ x, y });
      }
    });
    setNodePoints(newPoints);
  }, [level.units]);
  
  useEffect(() => {
    // A small delay to ensure nodes are rendered and have positions
    const timeoutId = setTimeout(calculatePoints, 100); 
    
    const observer = new ResizeObserver(() => {
        calculatePoints();
    });
    if (containerRef.current) {
        observer.observe(containerRef.current);
    }
    
    return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
    };
}, [calculatePoints, level.units]);


  return (
    <div className="flex flex-col h-screen bg-[#0A192F] pt-24">
      <header className="relative text-center py-4 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <button onClick={onBack} className="absolute top-1/2 -translate-y-1/2 start-4 p-3 rounded-full bg-slate-700 shadow-md hover:bg-slate-600 transition">
          <ChevronRightIcon className="w-6 h-6 text-slate-200" />
        </button>
        <div className="pt-2">
          <p className="text-sm font-bold text-gold-royal">المستوى {level.level_id}</p>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">{level.title}</h1>
        </div>
      </header>
      <main ref={containerRef} className="relative flex-1 overflow-y-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <PathConnector points={nodePoints} />
        <div className="relative space-y-6 pt-4">
          
          {level.units.map((unit, index) => {
            const isCompleted = isUnitCompleted(unit);
            const isUnlocked = isAdmin || index === 0 || isUnitCompleted(level.units[index - 1]);
            return (
              <div key={unit.unit_id} className="relative z-10">
                <UnitNode
                  unit={unit}
                  onClick={() => onSelectUnit(unit.unit_id)}
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  setRef={(el) => {
                    if (el) {
                        nodeRefs.current.set(unit.unit_id, el);
                    } else {
                        nodeRefs.current.delete(unit.unit_id);
                    }
                  }}
                />
              </div>
            );
          })}
          
          {level.units.length === 0 && (
            <div className="text-center py-10 px-4 bg-slate-800 rounded-lg shadow-md">
              <p className="text-slate-300 text-lg">المحتوى لهذا المستوى سيضاف قريبًا بإذن الله.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LevelScreen;
