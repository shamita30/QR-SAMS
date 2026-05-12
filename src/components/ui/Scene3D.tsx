import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Torus } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <Sphere ref={meshRef} visible args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#f43f5e"
        attach="material"
        distort={0.35}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        emissive="#1a0800"
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
};

const OrbitRing = ({ radius, speed, color }: { radius: number; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * speed * 0.5;
      ref.current.rotation.z = state.clock.getElapsedTime() * speed * 0.3;
    }
  });

  return (
    <Torus ref={ref} args={[radius, 0.02, 16, 100]}>
      <meshStandardMaterial color={color} transparent opacity={0.4} emissive={color} emissiveIntensity={0.5} />
    </Torus>
  );
};

const FloatingParticle = ({ position, color }: { position: [number, number, number]; color: string }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position}>
        <octahedronGeometry args={[0.08]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </Float>
  );
};

interface Scene3DProps {
  className?: string;
}

const Scene3D: React.FC<Scene3DProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} color="#f43f5e" />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#fda4af" />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#93c5fd" />
        
        <AnimatedSphere />
        
        {/* Orbit rings */}
        <OrbitRing radius={3} speed={0.4} color="#f43f5e" />
        <OrbitRing radius={3.5} speed={0.3} color="#fda4af" />
        <OrbitRing radius={4} speed={0.2} color="#38bdf8" />
        
        {/* Floating particles */}
        {[
          [2, 1, 0], [-1.5, 1.5, 1], [1, -1.5, 0.5], [-2, -1, -0.5],
          [0.5, 2, -1], [-1, -2, 1], [2.5, 0, -0.5], [-0.5, 0.5, 2]
        ].map((pos, i) => (
          <FloatingParticle 
            key={i} 
            position={pos as [number, number, number]} 
            color={['#f43f5e', '#fda4af', '#93c5fd', '#38bdf8'][i % 4]} 
          />
        ))}
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
