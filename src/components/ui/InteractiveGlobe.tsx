import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

const InteractiveGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [globe, setGlobe] = useState<THREE.Mesh | null>(null);
  const textureLoader = new THREE.TextureLoader();

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    // Ajustar la posición de la cámara según el tamaño de la pantalla
    if (window.innerWidth < 768) {
      camera.position.z = 10; // Móvil: más alejado
    } else {
      camera.position.z = 8; // Escritorio: más cerca
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    textureLoader.load(
      "/images/globe/mapa-global.png",
      (texture) => {
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.7,
          metalness: 0.3
        });

        // Ajustar el tamaño del globo según el tamaño de la pantalla
        const globeSize = window.innerWidth < 768 ? 3.9 : 3.8; // Reducido el tamaño

        const geometry = new THREE.SphereGeometry(globeSize, 64, 64);
        const globeMesh = new THREE.Mesh(geometry, material);
        scene.add(globeMesh);
        setGlobe(globeMesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        scene.add(ambientLight, directionalLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.7;
        controls.enableZoom = false;

        const animate = () => {
          requestAnimationFrame(animate);
          globeMesh.rotation.y += 0.001;
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        gsap.fromTo(globeMesh.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" });

        const handleResize = () => {
  camera.aspect = mountRef.current!.clientWidth / mountRef.current!.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);

  // Ajustar la cámara y el tamaño del globo en tiempo real
  if (window.innerWidth < 768) {
    camera.position.z = 10;
    globeMesh.scale.set(0.7, 0.7, 0.7); // Reducido en móvil
  } else {
    camera.position.z = 8;
    globeMesh.scale.set(0.9, 0.9, 0.9); // Reducido en escritorio
  }
};

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          mountRef.current?.removeChild(renderer.domElement);
        };
      },
      undefined,
      (error) => console.error("❌ Error al cargar la textura del globo:", error)
    );
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[600px] lg:h-[800px] flex justify-center items-center">
      <div ref={mountRef} className="globe-container w-full h-full"></div>
    </div>
  );
};

export default InteractiveGlobe;