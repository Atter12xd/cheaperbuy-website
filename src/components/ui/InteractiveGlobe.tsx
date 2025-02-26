import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

const InteractiveGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isGlobeClicked, setIsGlobeClicked] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, window.innerWidth < 768 ? 10 : 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/images/globe/joven.jpeg",
      (texture) => {
        texture.offset.x = -0.1;
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.7,
          metalness: 0.3
        });

        const globeSize = window.innerWidth < 768 ? 4.68 : 3.8;
        const geometry = new THREE.SphereGeometry(globeSize, 64, 64);
        const globeMesh = new THREE.Mesh(geometry, material);
        scene.add(globeMesh);
        globeRef.current = globeMesh; // Guardamos la referencia

        // 🔄 Posición inicial
        globeMesh.position.x = 0.1;

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        scene.add(ambientLight, directionalLight);

        // Controles de OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controlsRef.current = controls; // Guardamos la referencia

        // 🔄 Movimiento de rotación automática
        gsap.to(globeMesh.rotation, {
          x: Math.PI * 0.2,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });

        // Animación de aparición
        gsap.fromTo(globeMesh.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 1, ease: "elastic.out(1, 0.2)" });

        // Render loop
        const animate = () => {
          requestAnimationFrame(animate);
          if (!isGlobeClicked) controls.update(); // Solo actualizar controles si no se ha hecho clic
          renderer.render(scene, camera);
        };
        animate();

        // Ajuste en tiempo real
        const handleResize = () => {
          camera.aspect = mountRef.current!.clientWidth / mountRef.current!.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
          camera.position.z = window.innerWidth < 768 ? 10 : 8;
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
  }, []); // ❌ isGlobeClicked eliminado del array de dependencias

  // 🔹 Evento para deshabilitar el control cuando se hace clic
  const handleGlobeClick = () => {
    setIsGlobeClicked(true);
    if (controlsRef.current) {
      controlsRef.current.enabled = false; // Desactivar controles
    }
  };

  return (
    <div className="relative w-full h-[550px] md:h-[620px] lg:h-[700px] flex justify-center items-center">
      <div ref={mountRef} className="globe-container w-full h-full" onClick={handleGlobeClick}></div>
    </div>
  );
};

export default InteractiveGlobe;