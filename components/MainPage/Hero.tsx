'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function HeroSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
          {/* Replace this with a more complex 3D model if needed */}
          <mesh>
            <icosahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color="#3b82f6" wireframe />
          </mesh>
        </Canvas>
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
        >
          Trade Smarter with
          <span className="text-blue-500 glow-text ml-2">TradeView</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
        >
          Professional trading platform with real-time market data, advanced charting, and comprehensive portfolio management.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth">
            <Button className="neon-button px-8 py-3 text-lg">Start Trading Now</Button>
          </Link>
          <Button
            variant="outline"
            className="glass-button text-white border border-white/30 hover:bg-white/10 px-8 py-3 text-lg"
          >
            Watch Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
