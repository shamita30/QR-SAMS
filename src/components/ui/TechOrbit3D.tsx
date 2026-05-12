import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const techStack = [
  { name: 'React', color: '#61dafb' },
  { name: 'Python', color: '#93c5fd' },
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'TypeScript', color: '#38bdf8' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Docker', color: '#0db7ed' },
  { name: 'Git', color: '#f43f5e' },
  { name: 'AI/ML', color: '#fda4af' },
  { name: 'MongoDB', color: '#4db33d' },
  { name: 'MySQL', color: '#f29111' },
];

/* ─── Laptop 3D Model ─── */
const Laptop = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.4}>
      {/* Screen */}
      <group position={[0, 0.95, -0.05]} rotation={[-0.15, 0, 0]}>
        {/* Screen bezel */}
        <mesh>
          <boxGeometry args={[2.2, 1.45, 0.06]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Screen display */}
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.95, 1.2]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={0.15}
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>
        {/* Screen glow lines - simulating code */}
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[-0.6 + Math.random() * 0.3, 0.4 - i * 0.15, 0.04]}>
            <planeGeometry args={[0.5 + Math.random() * 0.8, 0.04]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#f43f5e' : i % 3 === 1 ? '#38bdf8' : '#fda4af'}
              emissive={i % 3 === 0 ? '#f43f5e' : i % 3 === 1 ? '#38bdf8' : '#fda4af'}
              emissiveIntensity={0.8}
              transparent
              opacity={0.6 + Math.random() * 0.3}
            />
          </mesh>
        ))}
        {/* Camera dot */}
        <mesh position={[0, 0.63, 0.035]}>
          <circleGeometry args={[0.02, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Base / Keyboard */}
      <mesh position={[0, 0.15, 0.35]}>
        <boxGeometry args={[2.3, 0.08, 1.5]} />
        <meshStandardMaterial color="#16162a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Trackpad */}
      <mesh position={[0, 0.2, 0.6]}>
        <boxGeometry args={[0.7, 0.01, 0.45]} />
        <meshStandardMaterial color="#1e1e3a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Keyboard keys hint */}
      <mesh position={[0, 0.2, 0.1]}>
        <boxGeometry args={[1.8, 0.01, 0.6]} />
        <meshStandardMaterial color="#1e1e3a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Screen glow on desk */}
      <pointLight position={[0, 0.5, 0.3]} intensity={0.6} color="#38bdf8" distance={4} />
    </group>
  );
};

/* Orbiting Tech Node */
const TechNode = ({ index, total, color }: { index: number; total: number; color: string }) => {
  const ref = useRef<THREE.Group>(null);
  const angle = (Math.PI * 2 / total) * index;
  const radius = 3.5 + (index % 3) * 0.5;
  const speed = 0.08 + (index * 0.012);
  const yOffset = (index % 2 === 0 ? 0.4 : -0.4);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + angle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = yOffset + Math.sin(t * 1.5) * 0.5;
  });

  return (
    <group ref={ref}>
      <Float speed={3} floatIntensity={0.3}>
        <mesh>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.85}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      </Float>
    </group>
  );
};

/* Orbit Ring */
const Ring = ({ radius, speed, color }: { radius: number; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.getElapsedTime() * speed * 0.3;
    ref.current.rotation.z = state.clock.getElapsedTime() * speed * 0.15;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.01, 16, 64]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.35} />
    </mesh>
  );
};

/* Particle dust */
const OrbitDust = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#f43f5e'),
      new THREE.Color('#fda4af'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#ffffff'),
    ];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 4;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

interface TechOrbit3DProps {
  className?: string;
  fullPage?: boolean;
}

const TechOrbit3D: React.FC<TechOrbit3DProps> = ({ className = '', fullPage = false }) => {
  return (
    <div className={`${fullPage ? 'fixed inset-0 z-0' : 'w-full h-full'} ${className}`}>
      <Canvas 
        camera={{ position: [0, 3, 7], fov: 50 }} 
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 8, 5]} intensity={0.5} color="#f43f5e" />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#38bdf8" />
        <pointLight position={[0, 4, 0]} intensity={0.5} color="#fda4af" distance={12} />

        <Laptop />

        <Ring radius={3.5} speed={0.3} color="#f43f5e" />
        <Ring radius={4.2} speed={0.2} color="#fda4af" />
        <Ring radius={5} speed={0.15} color="#38bdf8" />
        <Ring radius={5.8} speed={0.1} color="#93c5fd" />

        {techStack.map((tech, i) => (
          <TechNode key={tech.name} index={i} total={techStack.length} color={tech.color} />
        ))}

        <OrbitDust />

        <fog attach="fog" args={['#060a14', 6, 20]} />
      </Canvas>
    </div>
  );
};

export default TechOrbit3D;
