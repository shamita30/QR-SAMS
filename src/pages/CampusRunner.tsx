import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRunnerStore } from '../store/useRunnerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Coins, Zap, ShieldAlert, ArrowLeft, Trophy, Terminal, Cpu, Database, AlertCircle } from 'lucide-react';
import NeonButton from '../components/ui/NeonButton';
import { useGamificationStore } from '../store/useGamificationStore';

// --- GAME CONFIG ---
const LANE_WIDTH = 3.5;
const GRAVITY = -45;

// --- 3D COMPONENTS ---

const RainbowTrail = ({ active }: { active: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && active) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 10;
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[0, 0, -0.5]}>
      {['#ff0000', '#ff8243', '#fce883', '#00ff00', '#00d4ff', '#a855f7'].map((color, i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.4, Math.sin(i * Math.PI / 3) * 0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const PlayerAvatar = () => {
  const playerRef = useRef<THREE.Group>(null);
  const { playerLane, isJumping, isSliding, setJumping, setSliding, isGameOver } = useRunnerStore();
  const [velocity, setVelocity] = useState(0);
  const [yPos, setYPos] = useState(0.5); 
  const currentX = useRef(0);
  const [boosting, setBoosting] = useState(false);

  // Expose boosting state from some store action later if needed, right now we just use a local timer effect if speed > 30
  const { speed } = useRunnerStore();
  useEffect(() => {
    if (speed > 25) {
      setBoosting(true);
      const t = setTimeout(() => setBoosting(false), 2000);
      return () => clearTimeout(t);
    }
  }, [speed]);

  useFrame((state, delta) => {
    if (isGameOver || !playerRef.current) return;

    const targetX = playerLane * LANE_WIDTH;
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX, 15 * delta);
    
    let newY = yPos;
    let newVel = velocity;
    
    if (isJumping) {
      newVel += GRAVITY * delta;
      newY += newVel * delta;
      
      if (newY <= 0.5) {
        newY = 0.5;
        newVel = 0;
        setJumping(false);
      }
    }
    
    setYPos(newY);
    setVelocity(newVel);
    
    playerRef.current.position.x = currentX.current;
    playerRef.current.position.y = isSliding && !isJumping ? 0.25 : newY;
    
    const tilt = (currentX.current - targetX) * -0.2;
    playerRef.current.rotation.z = tilt;
    
    if (!isJumping && !isSliding) {
      playerRef.current.position.y = newY + Math.sin(state.clock.elapsedTime * 15) * 0.1;
    }
  });

  return (
    <group ref={playerRef} position={[0, 0.5, 0]}>
      <mesh castShadow position={[0, isSliding ? -0.2 : 0.2, 0]}>
        <capsuleGeometry args={[0.4, isSliding ? 0.4 : 1, 4, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#609494"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      <mesh position={[0, isSliding ? -0.4 : -0.4, 0]} rotation={[Math.PI/2, 0, 0]}>
        <capsuleGeometry args={[0.2, 1.2, 4, 8]} />
        <meshStandardMaterial color="#ffc0cb" emissive="#ffc0cb" emissiveIntensity={2} />
      </mesh>

      <RainbowTrail active={boosting} />
      <pointLight position={[0, 0, -1]} color="#ffc0cb" intensity={3} distance={5} />
    </group>
  );
};

// Vibrant Rainbow Tech City
const VibrantTechCity = () => {
  const { speed, isPlaying } = useRunnerStore();
  const groupRef = useRef<THREE.Group>(null);
  const trackRef = useRef<THREE.Mesh>(null);
  
  const environmentProps = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const isLeft = i % 2 === 0;
      const x = isLeft ? -12 - Math.random() * 20 : 12 + Math.random() * 20;
      const z = -Math.random() * 300;
      const type = Math.random() > 0.6 ? 'laptop' : Math.random() > 0.3 ? 'monitor' : 'server';
      const color = ['#ff8243', '#ffc0cb', '#fce883', '#609494', '#00d4ff', '#a855f7'][Math.floor(Math.random() * 6)];
      return { x, z, type, color, rot: Math.random() * Math.PI };
    });
  }, []);

  useFrame((_, delta) => {
    if (!isPlaying || !groupRef.current || !trackRef.current) return;
    
    groupRef.current.children.forEach((child) => {
      child.position.z += speed * delta;
      if (child.position.z > 40) {
        child.position.z = -260;
      }
    });

    const material = trackRef.current.material as THREE.MeshStandardMaterial;
    if (material.map) {
      material.map.offset.y -= speed * delta * 0.015;
    }
  });

  const neonGrid = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#100a1c'; // Bright deep purple
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#ffc0cb';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i <= 512; i += 64) {
        ctx.moveTo(i, 0); ctx.lineTo(i, 512);
        ctx.moveTo(0, i); ctx.lineTo(512, i);
      }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 40);
    return tex;
  }, []);

  return (
    <group>
      {/* Rainbow Motherboard Track */}
      <mesh ref={trackRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]} receiveShadow>
        <planeGeometry args={[LANE_WIDTH * 3 + 2, 400]} />
        <meshStandardMaterial map={neonGrid} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* RGB Glowing Lanes */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[-LANE_WIDTH/2, 0.05, -50]}>
        <planeGeometry args={[0.3, 400]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[LANE_WIDTH/2, 0.05, -50]}>
        <planeGeometry args={[0.3, 400]} />
        <meshBasicMaterial color="#fce883" transparent opacity={0.6} />
      </mesh>

      {/* Scenery Props */}
      <group ref={groupRef}>
        {environmentProps.map((p, i) => (
          <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
            {p.type === 'laptop' && (
              <group position={[0, 2, 0]}>
                <Box args={[6, 0.5, 4]}>
                  <meshStandardMaterial color="#222" />
                </Box>
                <Box args={[6, 4, 0.5]} position={[0, 2.25, -2]} rotation={[-0.2, 0, 0]}>
                  <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.8} />
                </Box>
              </group>
            )}
            {p.type === 'server' && (
              <Box args={[4, 15, 4]} position={[0, 7.5, 0]}>
                <meshStandardMaterial color="#111" />
                <lineSegments>
                  <edgesGeometry args={[new THREE.BoxGeometry(4, 15, 4)]} />
                  <lineBasicMaterial color={p.color} />
                </lineSegments>
                <pointLight color={p.color} intensity={2} distance={10} position={[0, 0, 2]} />
              </Box>
            )}
            {p.type === 'monitor' && (
              <group position={[0, 5, 0]}>
                <Box args={[0.5, 5, 0.5]} position={[0, -2.5, 0]}>
                  <meshStandardMaterial color="#333" />
                </Box>
                <Box args={[8, 5, 0.5]}>
                  <meshStandardMaterial color="#111" emissive={p.color} emissiveIntensity={0.5} />
                </Box>
                {/* Floating holographic code on monitor */}
                <Text position={[0, 0, 0.3]} fontSize={0.5} color="#ffffff" fillOpacity={0.8}>
                  {'{ config: true }'}
                </Text>
              </group>
            )}
          </group>
        ))}
        
        {/* Floating tech symbols */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Text key={`sym-${i}`} position={[(Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 10), 10 + Math.random() * 10, -Math.random() * 200]} fontSize={2} color="#fce883" fillOpacity={0.5} rotation={[0, Math.random() * Math.PI, 0]}>
            {'</>'}
          </Text>
        ))}
      </group>
    </group>
  );
};

// Glitch Monster Chaser
const GlitchMonster = () => {
  const { chaserDistance, playerLane, isGameOver } = useRunnerStore();
  const chaserRef = useRef<THREE.Group>(null);
  const targetX = useRef(0);

  useFrame((state, delta) => {
    if (!chaserRef.current || isGameOver) return;
    
    targetX.current = THREE.MathUtils.lerp(targetX.current, playerLane * LANE_WIDTH, 10 * delta);
    chaserRef.current.position.x = targetX.current;

    const targetZ = chaserDistance; 
    chaserRef.current.position.z = THREE.MathUtils.lerp(chaserRef.current.position.z, targetZ, 5 * delta);
    
    // Glitch jitter effect
    chaserRef.current.position.x += (Math.random() - 0.5) * 0.2;
    chaserRef.current.position.y = 2 + (Math.random() - 0.5) * 0.2;
    chaserRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 20) * 0.05);
  });

  return (
    <group ref={chaserRef} position={[0, 2, 10]}>
      {/* Glitch Body */}
      <Box args={[3, 3, 3]}>
        <meshStandardMaterial color="#ff00ff" emissive="#ff0000" emissiveIntensity={2} wireframe />
      </Box>
      <Box args={[3.2, 1, 3.2]} position={[0, Math.sin(Date.now() * 0.01), 0]}>
         <meshStandardMaterial color="#00ffff" transparent opacity={0.5} />
      </Box>
      <pointLight color="#ff0000" intensity={10} distance={20} position={[0, 0, -2]} />
      <Text position={[0, 2.5, -1.5]} fontSize={1} color="#ff0000" fillOpacity={0.8} outlineWidth={0.1} outlineColor="#000">
        ! ERROR !
      </Text>
    </group>
  );
};

// Obstacles and Quizzes
const TechObstacleManager = ({ onWrongAnswer }: { onWrongAnswer: (q: string, explanation: string) => void }) => {
  const { speed, isPlaying, isGameOver, addCoin, playerLane, isJumping, isSliding, updateChaser, increaseSpeed } = useRunnerStore();
  const [objects, setObjects] = useState<any[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const nextSpawnTime = useRef(0);
  const [quizActive, setQuizActive] = useState<any>(null);
  const { addXP } = useGamificationStore();

  const quizDB = [
    { q: "What does HTML stand for?", a1: "Hyper Text", a2: "High Tech", a3: "Hyper Tool", correct: 0, exp: "HTML stands for Hyper Text Markup Language, the standard for documents designed to be displayed in a web browser." },
    { q: "CSS is used for...", a1: "Logic", a2: "Styling", a3: "Database", correct: 1, exp: "CSS (Cascading Style Sheets) is used for styling and designing the layout of web pages." },
    { q: "React is a...", a1: "Library", a2: "Language", a3: "Browser", correct: 0, exp: "React is a JavaScript library for building user interfaces, not a programming language." },
    { q: "SQL stands for...", a1: "Safe Query", a2: "Strong Query", a3: "Structured Query", correct: 2, exp: "SQL stands for Structured Query Language, used for managing relational databases." }
  ];

  useFrame((state, delta) => {
    if (!isPlaying || isGameOver) return;

    if (state.clock.elapsedTime > nextSpawnTime.current) {
      const rand = Math.random();
      
      // 20% chance for a Quiz Gate
      if (rand < 0.2 && !quizActive) {
        const quiz = quizDB[Math.floor(Math.random() * quizDB.length)];
        const correctLane = Math.floor(Math.random() * 3) - 1;
        
        // Shuffle answers to lanes
        const answers = [quiz.a1, quiz.a2, quiz.a3];
        const correctText = answers[quiz.correct];
        answers.splice(quiz.correct, 1);
        
        const laneMap = { [-1]: '', 0: '', 1: '' };
        laneMap[correctLane as keyof typeof laneMap] = correctText;
        
        const remainingLanes = [-1, 0, 1].filter(l => l !== correctLane);
        laneMap[remainingLanes[0] as keyof typeof laneMap] = answers[0];
        laneMap[remainingLanes[1] as keyof typeof laneMap] = answers[1];

        setQuizActive({
          q: quiz.q,
          laneMap,
          correctLane,
          exp: quiz.exp
        });
        
        [-1, 0, 1].forEach(lane => {
          setObjects(prev => [...prev, {
            id: Math.random().toString(),
            type: 'quiz_gate',
            lane,
            z: -150,
            active: true,
            isCorrect: lane === correctLane
          }]);
        });
        nextSpawnTime.current = state.clock.elapsedTime + 4;
        return;
      }

      // Normal spawning
      const type = rand > 0.5 ? 'gem' : 'malware';
      const lane = Math.floor(Math.random() * 3) - 1; 
      
      let obsType = 'firewall';
      if (type === 'malware') {
        const r2 = Math.random();
        if (r2 < 0.33) obsType = 'bug'; 
        else if (r2 < 0.66) obsType = 'laser'; 
      }

      setObjects((prev) => [...prev.filter(o => o.z < 10 && o.active), {
        id: Math.random().toString(),
        type,
        obsType,
        lane,
        z: -120,
        active: true
      }]);
      
      const spawnDelay = Math.max(0.4, 1.2 - (speed * 0.015));
      nextSpawnTime.current = state.clock.elapsedTime + spawnDelay;
    }

    // Move objects and check collisions
    const px = playerLane * LANE_WIDTH;
    const py = isJumping ? 2.5 : (isSliding ? 0.25 : 1);
    
    setObjects((prev) => {
      let collided = false;
      let wrongQuiz = false;

      const updated = prev.map((obj) => {
        if (!obj.active) return obj;
        
        const newZ = obj.z + speed * delta;
        const ox = obj.lane * LANE_WIDTH;
        
        const inZ = newZ > -0.5 && newZ < 0.5;
        const inX = Math.abs(px - ox) < 1.0;
        
        if (inZ && inX) {
          if (obj.type === 'gem') {
            addCoin();
            return { ...obj, z: newZ, active: false };
          } else if (obj.type === 'malware') {
            let hit = false;
            if (obj.obsType === 'bug') {
              if (py < 1.5) hit = true;
            } else if (obj.obsType === 'laser') {
              if (!isSliding) hit = true;
            } else {
              hit = true;
            }
            if (hit) collided = true;
          } else if (obj.type === 'quiz_gate') {
            if (!obj.isCorrect) {
              wrongQuiz = true;
            } else {
               increaseSpeed(10); // Speed boost
               addCoin(); addCoin(); addCoin();
               addXP(50, 'Quiz Gate Cleared');
            }
            setQuizActive(null);
            return { ...obj, z: newZ, active: false };
          }
        }
        
        if (obj.type === 'quiz_gate' && newZ > 5 && obj.lane === 0) {
           setQuizActive(null);
        }

        return { ...obj, z: newZ };
      });

      if (collided) {
        updateChaser(-6); 
        return updated.map(o => (Math.abs(o.z) < 1 && o.type !== 'gem') ? { ...o, active: false } : o);
      }

      if (wrongQuiz) {
        updateChaser(-10);
        increaseSpeed(-10); // slow down
        if (quizActive) {
          onWrongAnswer(quizActive.q, quizActive.exp);
        }
        return updated.map(o => (Math.abs(o.z) < 1 && o.type === 'quiz_gate') ? { ...o, active: false } : o);
      }

      return updated;
    });
  });

  return (
    <group ref={groupRef}>
      {quizActive && (
        <group position={[0, 6, -100]}>
          <Box args={[16, 3, 0.5]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#0c1020" emissive="#ffc0cb" emissiveIntensity={0.5} transparent opacity={0.8} />
          </Box>
          <Text position={[0, 0, 0.3]} fontSize={1.5} color="#ffffff" outlineWidth={0.05} outlineColor="#ff8243">
            {quizActive.q}
          </Text>
        </group>
      )}

      {objects.map((obj) => {
        if (!obj.active) return null;
        
        if (obj.type === 'gem') {
          return (
            <mesh key={obj.id} position={[obj.lane * LANE_WIDTH, 1.5, obj.z]} rotation={[Math.PI/4, Date.now() * 0.005, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
            </mesh>
          );
        }

        if (obj.type === 'quiz_gate') {
          return (
            <group key={obj.id} position={[obj.lane * LANE_WIDTH, 2, obj.z]}>
              <mesh>
                <planeGeometry args={[LANE_WIDTH - 0.5, 5]} />
                <meshBasicMaterial color={obj.isCorrect ? "#00ff00" : "#ff00ff"} transparent opacity={0.3} />
              </mesh>
              <Box args={[LANE_WIDTH - 0.5, 0.2, 0.2]} position={[0, 2.5, 0]}>
                 <meshBasicMaterial color={obj.isCorrect ? "#00ff00" : "#ff00ff"} />
              </Box>
              <Text position={[0, 0, 0.1]} fontSize={0.6} color="#ffffff" maxWidth={LANE_WIDTH - 0.8} textAlign="center" outlineWidth={0.05} outlineColor="#000">
                {quizActive?.laneMap[obj.lane]}
              </Text>
            </group>
          );
        }

        if (obj.obsType === 'bug') { 
          return (
            <RoundedBox key={obj.id} args={[LANE_WIDTH - 0.5, 1.5, 1]} position={[obj.lane * LANE_WIDTH, 0.75, obj.z]} radius={0.2}>
              <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
              <Text position={[0, 0, 0.51]} fontSize={0.5} color="#ffffff">MALWARE</Text>
            </RoundedBox>
          );
        } else if (obj.obsType === 'laser') { 
          return (
            <group key={obj.id} position={[obj.lane * LANE_WIDTH, 0, obj.z]}>
              <Box args={[0.2, 4, 0.2]} position={[-LANE_WIDTH/2 + 0.2, 2, 0]}>
                <meshStandardMaterial color="#609494" emissive="#609494" />
              </Box>
              <Box args={[0.2, 4, 0.2]} position={[LANE_WIDTH/2 - 0.2, 2, 0]}>
                <meshStandardMaterial color="#609494" emissive="#609494" />
              </Box>
              <Box args={[LANE_WIDTH, 0.2, 0.2]} position={[0, 2.5, 0]}>
                <meshStandardMaterial color="#ff8243" emissive="#ff8243" emissiveIntensity={4} />
              </Box>
            </group>
          );
        } else { 
          return (
            <Box key={obj.id} args={[LANE_WIDTH - 0.2, 5, 1]} position={[obj.lane * LANE_WIDTH, 2.5, obj.z]}>
              <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.8} wireframe />
              <Text position={[0, 0, 0.51]} fontSize={0.8} color="#ffffff">FIREWALL</Text>
            </Box>
          );
        }
      })}
    </group>
  );
};

// --- GAME LOGIC MANAGER ---
const GameManager = () => {
  const { isPlaying, isGameOver, speed, increaseSpeed, addScore, chaserDistance, updateChaser } = useRunnerStore();
  
  useFrame((_, delta) => {
    if (isPlaying && !isGameOver) {
      addScore(speed * delta * 0.2); 
      // Cap speed to 50
      if (speed < 50) {
        increaseSpeed(delta * 0.5); 
      }
      
      if (chaserDistance < 25) {
        updateChaser(delta * 0.8); 
      }
    }
  });
  return null;
};

// --- CAMERA FOLLOW ---
const CameraFollow = () => {
  const { playerLane, isJumping, isSliding } = useRunnerStore();
  const { camera } = useThree();
  
  useFrame((_, delta) => {
    const targetX = playerLane * (LANE_WIDTH * 0.4); 
    const targetY = 6 + (isJumping ? 1.5 : 0) - (isSliding ? 1 : 0);
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 5 * delta);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 5 * delta);
    camera.lookAt(playerLane * LANE_WIDTH * 0.3, 2, -30);
  });
  return null;
};

// --- MAIN COMPONENT ---
const CampusRunner: React.FC = () => {
  const navigate = useNavigate();
  const { addCoins: addGlobalCoins, addXP } = useGamificationStore();
  const store = useRunnerStore();
  const [learningPopup, setLearningPopup] = useState<{q: string, exp: string} | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!store.isPlaying || store.isGameOver || learningPopup) {
        if (e.code === 'Space' && !store.isPlaying && !learningPopup) store.startGame();
        return;
      }
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': store.setPlayerLane(store.playerLane - 1); break;
        case 'ArrowRight': case 'KeyD': store.setPlayerLane(store.playerLane + 1); break;
        case 'ArrowUp': case 'KeyW': case 'Space': if (!store.isJumping) store.setJumping(true); break;
        case 'ArrowDown': case 'KeyS': store.setSliding(true); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') store.setSliding(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [store, learningPopup]);

  useEffect(() => {
    if (store.isGameOver && store.score > 0) {
      addGlobalCoins(store.coinsCollected, 'Tech Run');
      addXP(Math.floor(store.score), 'Quest Progression');
    }
  }, [store.isGameOver]);

  const handleWrongAnswer = (q: string, exp: string) => {
    setLearningPopup({ q, exp });
    // Pause game briefly using a small timeout, or just let them read and click continue
  };

  const closeLearningPopup = () => {
    setLearningPopup(null);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden flex flex-col font-inter bg-gradient-to-br from-[#1a0b2e] via-[#0d1430] to-[#0a1f24]">
      
      {/* ═══ HUD OVERLAY ═══ */}
      <div className="absolute top-0 inset-x-0 z-10 p-6 flex justify-between items-start pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <button onClick={() => navigate('/dashboard')} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 shadow-[0_0_15px_rgba(255,192,203,0.5)] bg-white/10 backdrop-blur-md">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-outfit font-black text-3xl uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,130,67,1)] flex items-center gap-2">
              <Database className="text-[#ff8243]" size={28} /> SQL Quest
            </h1>
            <p className="text-xs font-mono text-[#00d4ff] uppercase tracking-widest font-bold drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]">Rainbow CPU Highway</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="glass px-6 py-3 rounded-2xl border-white/20 flex items-center gap-3 shadow-[0_0_20px_rgba(0,255,0,0.4)] bg-black/20">
            <Coins className="text-[#00ff00]" size={20} />
            <span className="font-outfit font-black text-2xl text-white">{store.coinsCollected} <span className="text-[10px] text-white/60 uppercase">Gems</span></span>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border-white/20 flex items-center gap-3 shadow-[0_0_20px_rgba(0,212,255,0.4)] bg-black/20">
            <Zap className="text-[#00d4ff]" size={20} />
            <span className="font-outfit font-black text-2xl text-white">{Math.floor(store.score)} <span className="text-[10px] text-white/60 uppercase">XP</span></span>
          </div>
        </div>
      </div>

      {/* CHASER WARNING */}
      <AnimatePresence>
        {store.isPlaying && store.chaserDistance < 10 && !store.isGameOver && !learningPopup && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-10 bg-[#ff00ff]/30 border-2 border-[#ff0000] px-8 py-3 rounded-full flex items-center gap-3 backdrop-blur-md shadow-[0_0_40px_rgba(255,0,0,0.8)]"
          >
            <ShieldAlert size={24} className="text-[#ff0000] animate-bounce" />
            <span className="text-lg font-black text-white uppercase tracking-[0.2em] font-outfit drop-shadow-[0_0_5px_rgba(255,0,0,1)]">GLITCH MONSTER CLOSE!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 3D ENGINE ═══ */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [0, 6, 15], fov: 70 }}>
          <color attach="background" args={['#1a0b2e']} />
          <fog attach="fog" args={['#1a0b2e', 40, 200]} />
          <ambientLight intensity={1} />
          <directionalLight position={[20, 40, 10]} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
          
          <PlayerAvatar />
          <VibrantTechCity />
          <TechObstacleManager onWrongAnswer={handleWrongAnswer} />
          <GlitchMonster />
          <GameManager />
          <CameraFollow />
        </Canvas>
      </div>

      {/* ═══ LEARNING POPUP (WRONG ANSWER) ═══ */}
      <AnimatePresence>
        {learningPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#ff0000]/20 backdrop-blur-sm"
          >
            <div className="glass p-10 rounded-[3rem] border-[#ff0000]/50 max-w-xl text-center shadow-[0_0_50px_rgba(255,0,0,0.4)] bg-[#100a1c]/90">
              <div className="w-20 h-20 bg-[#ff0000]/20 border border-[#ff0000] rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-[#ff0000]" />
              </div>
              <h3 className="text-3xl font-black font-outfit text-white mb-2 uppercase">Incorrect Route!</h3>
              <p className="text-[#ffc0cb] font-bold mb-6">{learningPopup.q}</p>
              <div className="bg-black/50 p-6 rounded-2xl border border-white/10 mb-8">
                <p className="text-white text-lg leading-relaxed">{learningPopup.exp}</p>
              </div>
              <NeonButton onClick={closeLearningPopup} variant="primary" className="w-full py-4 text-lg justify-center shadow-[0_0_20px_rgba(0,212,255,0.6)]">
                CONTINUE RUN
              </NeonButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ START / GAME OVER OVERLAYS ═══ */}
      <AnimatePresence>
        {!store.isPlaying && !store.isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-[#1a0b2e]/80 backdrop-blur-lg"
          >
            <div className="text-center glass p-12 rounded-[3rem] border-white/20 max-w-2xl relative overflow-hidden bg-white/5 shadow-[0_0_100px_rgba(255,130,67,0.2)]">
              <div className="w-28 h-28 bg-gradient-to-br from-[#ff8243] via-[#ffc0cb] to-[#00d4ff] rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,130,67,0.6)] border-2 border-white">
                <Cpu size={50} className="text-white" />
              </div>
              <h2 className="text-6xl font-black font-outfit uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ff8243] via-[#fce883] to-[#00d4ff]">
                Cyber Quest
              </h2>
              <p className="text-sm text-white/80 uppercase font-bold tracking-[0.3em] mb-10 font-mono">Escape the Glitch Monster</p>
              
              <div className="grid grid-cols-3 gap-4 mb-10 text-left">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <p className="text-[#00d4ff] font-black text-lg mb-1">DODGE</p>
                  <p className="text-xs text-white/70 font-medium">Swipe L/R to avoid Malware.</p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <p className="text-[#fce883] font-black text-lg mb-1">ANSWER</p>
                  <p className="text-xs text-white/70 font-medium">Run into the correct Quiz Gate.</p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <p className="text-[#ffc0cb] font-black text-lg mb-1">SURVIVE</p>
                  <p className="text-xs text-white/70 font-medium">Don't let the Glitch catch you!</p>
                </div>
              </div>

              <NeonButton onClick={store.startGame} variant="yellow" className="w-full py-6 text-2xl justify-center uppercase tracking-[0.2em] font-black shadow-[0_0_40px_rgba(252,232,131,0.6)]">
                START ADVENTURE
              </NeonButton>
            </div>
          </motion.div>
        )}

        {store.isGameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-[#2a0815]/90 backdrop-blur-xl"
          >
            <div className="text-center glass p-12 rounded-[3rem] border-[#ff00ff]/40 max-w-lg relative overflow-hidden bg-black/50">
              <div className="w-28 h-28 bg-[#ff0000]/20 border-4 border-[#ff00ff] rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-[0_0_80px_rgba(255,0,255,0.5)]">
                <ShieldAlert size={60} className="text-[#ff00ff]" />
              </div>
              <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter text-[#ff00ff] mb-2 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">SYSTEM CRASH</h2>
              <p className="text-sm text-white/80 mb-10 font-medium uppercase tracking-[0.3em] font-mono">Assimilated by Glitch</p>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <p className="text-[12px] text-[#00d4ff] uppercase font-bold tracking-[0.2em] mb-2">XP Earned</p>
                  <p className="text-4xl font-black font-outfit text-white drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">{Math.floor(store.score)}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <p className="text-[12px] text-[#00ff00] uppercase font-bold tracking-[0.2em] mb-2">Gems Collected</p>
                  <p className="text-4xl font-black font-outfit text-white drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">{store.coinsCollected}</p>
                </div>
              </div>
              
              <div className="flex gap-4 relative z-10">
                <button onClick={() => navigate('/dashboard')} className="flex-1 py-5 glass rounded-2xl border-white/20 text-white hover:bg-white/10 uppercase font-bold text-xs tracking-widest transition-all">
                  Back to Map
                </button>
                <NeonButton onClick={store.startGame} variant="pink" className="flex-1 py-5 justify-center uppercase tracking-[0.2em] font-black text-sm shadow-[0_0_30px_rgba(255,192,203,0.6)]">
                  PLAY AGAIN
                </NeonButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-0 lg:hidden pointer-events-auto" 
        onTouchStart={(e) => {}}
      />
    </div>
  );
};

export default CampusRunner;
