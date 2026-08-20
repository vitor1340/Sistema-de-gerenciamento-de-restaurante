'use client';

import { motion, MotionValue, useMotionValue, useSpring, useTransform, type SpringOptions } from 'framer-motion';
import { Children, cloneElement, createContext, useContext, useRef } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_BASE_SIZE = 18;
const DEFAULT_MAGNIFICATION = 26;
const DEFAULT_DISTANCE = 70;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  baseSize?: number;
  magnification?: number;
  spring?: SpringOptions;
};
type DockItemProps = {
  className?: string;
  children: React.ReactNode;
};
type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DockContextType = {
  mouseY: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  baseSize: number;
  distance: number;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a Dock');
  }
  return context;
}

/**
 * Variante vertical do dock estilo macOS: os ícones aumentam de tamanho
 * conforme a proximidade vertical do mouse, para uso em menus laterais.
 */
function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  baseSize = DEFAULT_BASE_SIZE,
  distance = DEFAULT_DISTANCE,
}: DockProps) {
  const mouseY = useMotionValue(Infinity);

  return (
    <nav
      onMouseMove={({ pageY }) => mouseY.set(pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(className)}
    >
      <DockContext.Provider value={{ mouseY, spring, magnification, baseSize, distance }}>
        {children}
      </DockContext.Provider>
    </nav>
  );
}

function DockItem({ children, className }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseY } = useDock();

  const mouseDistance = useTransform(mouseY, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - domRect.y - domRect.height / 2;
  });

  return (
    <div ref={ref} className={cn('inline-flex shrink-0 items-center justify-center', className)}>
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement<DockIconProps & { mouseDistance?: MotionValue<number> }>, {
          mouseDistance,
        }),
      )}
    </div>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const mouseDistance = restProps['mouseDistance'] as MotionValue<number>;
  const { distance, magnification, baseSize, spring } = useDock();

  const sizeTransform = useTransform(mouseDistance, [-distance, 0, distance], [baseSize, magnification, baseSize]);
  const size = useSpring(sizeTransform, spring);

  return (
    <motion.div style={{ width: size, height: size }} className={cn('flex items-center justify-center', className)}>
      {children}
    </motion.div>
  );
}

export { Dock, DockItem, DockIcon };
