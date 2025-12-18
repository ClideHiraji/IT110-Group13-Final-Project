// resources/js/components/ThreeBackground.jsx

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Chapter configurations with unique 3D environments
const CHAPTER_CONFIGS = {
  ancient: {
    color: '#f59e0b',
    secondaryColor: '#fb923c',
    geometry: 'pyramid',
    particleCount: 120,
    lightIntensity: 1.2,
    cameraTarget: { x: 0, y: 0, z: 3 },
  },
  medieval: {
    color: '#8b5cf6',
    secondaryColor: '#a78bfa',
    geometry: 'cathedral',
    particleCount: 150,
    lightIntensity: 0.9,
    cameraTarget: { x: 0, y: 0, z: 2.5 },
  },
  renaissance: {
    color: '#06b6d4',
    secondaryColor: '#22d3ee',
    geometry: 'sphere',
    particleCount: 180,
    lightIntensity: 1.1,
    cameraTarget: { x: 0, y: 0, z: 2 },
  },
  baroque: {
    color: '#ef4444',
    secondaryColor: '#f87171',
    geometry: 'spiral',
    particleCount: 200,
    lightIntensity: 1.3,
    cameraTarget: { x: 0, y: 0, z: 1.5 },
  },
  modern: {
    color: '#10b981',
    secondaryColor: '#34d399',
    geometry: 'abstract',
    particleCount: 220,
    lightIntensity: 1.0,
    cameraTarget: { x: 0, y: 0, z: 1 },
  },
};

function ChapterGeometry({ config, opacity, isActive }) {
  const meshRef = useRef();
  const [currentGeometry, setCurrentGeometry] = useState(null);

  // Create geometries based on chapter type
  const geometry = useMemo(() => {
    switch (config.geometry) {
      case 'pyramid':
        return new THREE.ConeGeometry(1, 2, 4);
      case 'cathedral':
        return new THREE.BoxGeometry(1, 2, 1);
      case 'sphere':
        return new THREE.IcosahedronGeometry(1, 2);
      case 'spiral':
        return new THREE.TorusKnotGeometry(0.7, 0.3, 100, 16);
      case 'abstract':
        return new THREE.OctahedronGeometry(1, 0);
      default:
        return new THREE.IcosahedronGeometry(1, 1);
    }
  }, [config.geometry]);

  useEffect(() => {
    setCurrentGeometry(geometry);
  }, [geometry]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotation based on chapter type
    if (config.geometry === 'pyramid') {
      meshRef.current.rotation.y += delta * 0.3;
    } else if (config.geometry === 'cathedral') {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    } else if (config.geometry === 'sphere') {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    } else if (config.geometry === 'spiral') {
      meshRef.current.rotation.x += delta * 0.25;
      meshRef.current.rotation.y += delta * 0.35;
    } else {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.z += delta * 0.2;
    }

    // Floating animation
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.2;

    // Scale pulsing
    const pulseScale = 1 + Math.sin(time * 2) * 0.05;
    meshRef.current.scale.setScalar(pulseScale);
  });

  if (!currentGeometry || opacity <= 0) return null;

  return (
    <mesh ref={meshRef} geometry={currentGeometry}>
      <meshStandardMaterial
        color={config.color}
        wireframe
        emissive={config.color}
        emissiveIntensity={config.lightIntensity * 0.4}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function ChapterParticles({ config, opacity }) {
  const particlesRef = useRef();
  const positions = useMemo(() => {
    const count = config.particleCount;
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
    }
    
    return pos;
  }, [config.particleCount]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Rotate particles
    particlesRef.current.rotation.y += delta * 0.1;
    particlesRef.current.rotation.x += delta * 0.05;

    // Pulsing effect
    const posArray = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < posArray.length; i += 3) {
      const pulse = Math.sin(time * 2 + i * 0.1) * 0.1;
      const baseX = positions[i];
      const baseY = positions[i + 1];
      const baseZ = positions[i + 2];
      
      const length = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
      posArray[i] = (baseX / length) * (length + pulse);
      posArray[i + 1] = (baseY / length) * (length + pulse);
      posArray[i + 2] = (baseZ / length) * (length + pulse);
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (opacity <= 0) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={config.particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={config.secondaryColor}
        transparent
        opacity={opacity * 0.8}
        sizeAttenuation
      />
    </points>
  );
}

function ChapterAmbientRings({ config, opacity }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state, delta) => {
    if (!ring1Ref.current || !ring2Ref.current) return;

    const time = state.clock.getElapsedTime();

    ring1Ref.current.rotation.x = time * 0.2;
    ring1Ref.current.rotation.y = time * 0.3;

    ring2Ref.current.rotation.x = -time * 0.25;
    ring2Ref.current.rotation.z = time * 0.15;
  });

  if (opacity <= 0) return null;

  return (
    <group>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.5, 0.03, 16, 100]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.5}
          transparent
          opacity={opacity * 0.4}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3, 0.03, 16, 100]} />
        <meshStandardMaterial
          color={config.secondaryColor}
          emissive={config.secondaryColor}
          emissiveIntensity={0.5}
          transparent
          opacity={opacity * 0.3}
        />
      </mesh>
    </group>
  );
}

function DynamicChapterScene() {
  const scrollY = useRef(0);
  const [currentChapter, setCurrentChapter] = useState('ancient');
  const [chapterProgress, setChapterProgress] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);
  const [sceneOpacity, setSceneOpacity] = useState(1);
  const cameraPos = useRef({ x: 0, y: 0, z: 8 });

  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate which chapter we're in (each chapter is 3 viewports tall)
      const totalScroll = scrollY.current;
      const chapterHeight = windowHeight * 3;
      const chapterIndex = Math.floor(totalScroll / chapterHeight);
      
      // Progress within current chapter (0 to 1)
      const progressInChapter = (totalScroll % chapterHeight) / chapterHeight;
      setChapterProgress(progressInChapter);
      
      // Determine if we're in the carousel/masterpieces section
      // Carousel appears at 35% - 90% of each chapter
      setShowCarousel(progressInChapter >= 0.35 && progressInChapter <= 0.9);
      
      // Map chapter index to chapter name
      const chapters = ['ancient', 'medieval', 'renaissance', 'baroque', 'modern'];
      const newChapter = chapters[Math.min(chapterIndex, chapters.length - 1)];
      
      if (newChapter !== currentChapter) {
        setCurrentChapter(newChapter);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentChapter]);

  useFrame((state, delta) => {
    const config = CHAPTER_CONFIGS[currentChapter];
    
    // Calculate 3D visibility based on chapter progress
    // 0-30%: Zoom in (visible)
    // 35-90%: Fade out for carousel
    // 90-100%: Fade back in for transition
    let targetOpacity = 1;
    let targetZ = 8;
    
    if (chapterProgress < 0.3) {
      // Intro phase: zoom in
      targetZ = 8 - (chapterProgress / 0.3) * 5;
      targetOpacity = 1;
    } else if (chapterProgress >= 0.35 && chapterProgress <= 0.9) {
      // Carousel phase: fade out and zoom in close
      const fadeProgress = (chapterProgress - 0.35) / 0.55;
      targetOpacity = 1 - fadeProgress;
      targetZ = 3 - fadeProgress * 2;
    } else if (chapterProgress > 0.9) {
      // Transition phase: fade back in
      const fadeIn = (chapterProgress - 0.9) / 0.1;
      targetOpacity = fadeIn;
      targetZ = 8 - (1 - fadeIn) * 5;
    }
    
    // Smooth camera movement
    cameraPos.current.z += (targetZ - cameraPos.current.z) * delta * 2;
    state.camera.position.z = cameraPos.current.z;
    
    // Store opacity for child components using state and userData
    setSceneOpacity(targetOpacity);
    if (!state.userData) state.userData = {};
    state.userData.sceneOpacity = targetOpacity;
  });

  return (
    <group>
      {Object.keys(CHAPTER_CONFIGS).map((chapterId) => {
        const config = CHAPTER_CONFIGS[chapterId];
        const isActive = chapterId === currentChapter;
        const baseOpacity = isActive ? 1 : 0;
        const finalOpacity = baseOpacity * sceneOpacity;
        
        return (
          <group key={chapterId}>
            <ChapterGeometry 
              config={config} 
              opacity={finalOpacity} 
              isActive={isActive} 
            />
            <ChapterParticles config={config} opacity={finalOpacity} />
            <ChapterAmbientRings config={config} opacity={finalOpacity} />
          </group>
        );
      })}
    </group>
  );
}

function DynamicLighting() {
  const light1Ref = useRef();
  const light2Ref = useRef();
  const light3Ref = useRef();
  const scrollY = useRef(0);
  const [currentChapter, setCurrentChapter] = useState('ancient');

  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      const windowHeight = window.innerHeight;
      const chapterHeight = windowHeight * 3;
      const chapterIndex = Math.floor(scrollY.current / chapterHeight);
      
      const chapters = ['ancient', 'medieval', 'renaissance', 'baroque', 'modern'];
      setCurrentChapter(chapters[Math.min(chapterIndex, chapters.length - 1)]);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    const config = CHAPTER_CONFIGS[currentChapter];
    const time = state.clock.getElapsedTime();
    const opacity = (state.userData && state.userData.sceneOpacity !== undefined) ? state.userData.sceneOpacity : 1;

    if (light1Ref.current) {
      light1Ref.current.intensity = config.lightIntensity * opacity;
      light1Ref.current.color.set(config.color);
      light1Ref.current.position.x = Math.sin(time * 0.5) * 5;
      light1Ref.current.position.y = Math.cos(time * 0.3) * 5;
    }

    if (light2Ref.current) {
      light2Ref.current.intensity = config.lightIntensity * 0.8 * opacity;
      light2Ref.current.color.set(config.secondaryColor);
      light2Ref.current.position.x = -Math.sin(time * 0.4) * 5;
      light2Ref.current.position.y = -Math.cos(time * 0.6) * 5;
    }

    if (light3Ref.current) {
      light3Ref.current.intensity = 0.5 * opacity;
    }
  });

  return (
    <>
      <ambientLight ref={light3Ref} intensity={0.5} />
      <pointLight ref={light1Ref} position={[5, 5, 5]} intensity={1} />
      <pointLight ref={light2Ref} position={[-5, -5, 5]} intensity={0.8} />
    </>
  );
}

function AdaptiveStars() {
  const starsRef = useRef();
  
  useFrame((state) => {
    if (!starsRef.current) return;
    
    const opacity = (state.userData && state.userData.sceneOpacity !== undefined) ? state.userData.sceneOpacity : 1;
    
    // Fade stars with scene
    if (starsRef.current.material) {
      starsRef.current.material.opacity = opacity * 0.6;
    }
  });

  return (
    <Stars
      ref={starsRef}
      radius={100}
      depth={50}
      count={3000}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Dynamic Chapter-Based Lighting */}
        <DynamicLighting />

        {/* Main Chapter Scene */}
        <DynamicChapterScene />
        
        {/* Adaptive Background Stars */}
        <AdaptiveStars />
      </Canvas>
    </div>
  );
}