// import React, { Suspense, useRef } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { Environment, Html, useGLTF } from "@react-three/drei";

// // Component for the GLB model
// function RotatingGLBModel() {
//   const ref = useRef();
//   const { scene } = useGLTF("/models/medusa_model.glb");

//   useFrame((_, delta) => {
//     ref.current.rotation.y += delta * 0.3;
//   });

//   return <primitive ref={ref} object={scene} scale={4} />; // <-- scaled up
// }

// export default function ThreeScene() {
//   return (
//     <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
//       <ambientLight intensity={1} />
//       <directionalLight intensity={1} position={[5, 5, 5]} />
//       <Suspense fallback={<Html center>Loading...</Html>}>
//         <RotatingGLBModel />
//         <Environment preset="studio" />
//       </Suspense>
//     </Canvas>
//   );
// }
