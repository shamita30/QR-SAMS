import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Particle Field: 600 data-stream particles ─── */
const ParticleField = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 600;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#f43f5e'),
      new THREE.Color('#fda4af'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#ffffff'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

/* ─── Grid Floor ─── */
const GridFloor = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <gridHelper args={[40, 40, '#f43f5e30', '#f43f5e10']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

/* ─── Floating Tech Objects ─── */
const FloatingObject = ({ position, color, speed, shape }: {
  position: [number, number, number];
  color: string;
  speed: number;
  shape: 'torus' | 'octa' | 'ico' | 'box';
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.getElapsedTime() * speed * 0.3;
    ref.current.rotation.y = state.clock.getElapsedTime() * speed * 0.5;
    ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed) * 0.5;
  });

  const geo = {
    torus: <torusGeometry args={[0.5, 0.15, 16, 32]} />,
    octa: <octahedronGeometry args={[0.4]} />,
    ico: <icosahedronGeometry args={[0.35, 0]} />,
    box: <boxGeometry args={[0.5, 0.5, 0.5]} />,
  };

  return (
    <mesh ref={ref} position={position}>
      {geo[shape]}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.7}
        wireframe={shape === 'ico' || shape === 'torus'}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
};

/* ─── Orbit Ring ─── */
const OrbitRing = ({ radius, speed, color }: { radius: number; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.getElapsedTime() * speed * 0.4;
    ref.current.rotation.z = state.clock.getElapsedTime() * speed * 0.2;
  });
  return (
    <Torus ref={ref} args={[radius, 0.015, 16, 80]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.5} />
    </Torus>
  );
};

/* ─── Central Core Sphere ─── */
const CoreSphere = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });
  return (
    <Sphere ref={ref} args={[1.2, 64, 64]}>
      <MeshDistortMaterial
        color="#f43f5e"
        emissive="#1a0800"
        emissiveIntensity={0.4}
        distort={0.25}
        speed={1.8}
        roughness={0.2}
        metalness={0.9}
        transparent
        opacity={0.85}
      />
    </Sphere>
  );
};

/* ─── Animated Camera ─── */
const CameraAnimation = ({ progress }: { progress: number }) => {
  useFrame(({ camera }) => {
    // Smooth camera path: starts far, zooms in
    const t = Math.min(progress, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad

    camera.position.x = THREE.MathUtils.lerp(8, 0, ease);
    camera.position.y = THREE.MathUtils.lerp(6, 2, ease);
    camera.position.z = THREE.MathUtils.lerp(12, 5, ease);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

/* ─── Tech Label Sprites (orbiting text) ─── */
const TechLabel = ({ label: _label, angle, radius, speed, yOffset }: {
  label: string; angle: number; radius: number; speed: number; yOffset: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + angle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = yOffset + Math.sin(t * 2) * 0.3;
  });

  return (
    <group ref={ref}>
      <Float speed={2} floatIntensity={0.5}>
        <mesh>
          <boxGeometry args={[0.5, 0.25, 0.05]} />
          <meshStandardMaterial
            color="#f43f5e"
            emissive="#f43f5e"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>
    </group>
  );
};

/* ─── Main Scene ─── */
interface IntroScene3DProps {
  progress: number;
}

const IntroScene3D: React.FC<IntroScene3DProps> = ({ progress }) => {
  const techLabels = ['React', 'Python', 'JS', 'TS', 'Node', 'Docker', 'Git', 'AI'];

  return (
    <Canvas
      camera={{ position: [8, 6, 12], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} color="#f43f5e" />
      <directionalLight position={[-10, -5, -5]} intensity={0.3} color="#fda4af" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#93c5fd" distance={15} />
      <pointLight position={[-5, -3, 5]} intensity={0.4} color="#38bdf8" distance={12} />

      {/* Camera Dolly */}
      <CameraAnimation progress={progress} />

      {/* Core */}
      <CoreSphere />
      
      {/* Orbit Rings */}
      <OrbitRing radius={2.5} speed={0.3} color="#f43f5e" />
      <OrbitRing radius={3.2} speed={0.2} color="#fda4af" />
      <OrbitRing radius={4} speed={0.15} color="#38bdf8" />
      <OrbitRing radius={5} speed={0.1} color="#93c5fd" />

      {/* Floating Tech Objects */}
      <FloatingObject position={[3, 2, -2]} color="#f43f5e" speed={0.6} shape="torus" />
      <FloatingObject position={[-4, 1, 3]} color="#fda4af" speed={0.4} shape="octa" />
      <FloatingObject position={[2, -2, 4]} color="#38bdf8" speed={0.5} shape="ico" />
      <FloatingObject position={[-3, 3, -3]} color="#93c5fd" speed={0.35} shape="box" />
      <FloatingObject position={[5, -1, -1]} color="#f43f5e" speed={0.45} shape="ico" />
      <FloatingObject position={[-2, -3, -4]} color="#fda4af" speed={0.55} shape="torus" />
      <FloatingObject position={[0, 4, 2]} color="#38bdf8" speed={0.3} shape="box" />
      <FloatingObject position={[-5, 0, 0]} color="#93c5fd" speed={0.5} shape="octa" />

      {/* Tech Label Orbits */}
      {techLabels.map((label, i) => (
        <TechLabel
          key={label}
          label={label}
          angle={(Math.PI * 2 / techLabels.length) * i}
          radius={3.5 + (i % 3) * 0.8}
          speed={0.15 + (i * 0.02)}
          yOffset={(i % 2 === 0 ? 0.5 : -0.5)}
        />
      ))}

      {/* Particle Field */}
      <ParticleField />

      {/* Grid Floor */}
      <GridFloor />

      {/* Fog */}
      <fog attach="fog" args={['#0a0e1a', 8, 25]} />
    </Canvas>
  );
};

export default IntroScene3D;
