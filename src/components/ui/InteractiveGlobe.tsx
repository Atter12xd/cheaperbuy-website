import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

const InteractiveGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);

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

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        scene.add(ambientLight, directionalLight);

        // 🚀 Habilitar controles con velocidad reducida
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Suaviza el movimiento
        controls.dampingFactor = 0.05; // Reduce la velocidad de desaceleración
        controls.rotateSpeed = 0.3; // Ajusta la velocidad de rotación (valor bajo = más lento)
        controls.minPolarAngle = Math.PI / 3; // Restringir la rotación vertical
        controls.maxPolarAngle = Math.PI - Math.PI / 3;
        controls.enableZoom = false; // Desactiva zoom para evitar cambios de escala

        // 🔄 Rotación automática suave
        const animateRotation = () => {
          gsap.to(globeMesh.rotation, {
            y: "+=0.5", // Rotación constante
            duration: 10, // Más lento
            repeat: -1,
            ease: "linear"
          });
        };
        animateRotation();

        // Render loop
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update(); // Mantiene la interacción suave
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
  }, []);

  return (
    <div className="relative w-full h-[550px] md:h-[620px] lg:h-[700px] flex justify-center items-center">
      <div ref={mountRef} className="globe-container w-full h-full"></div>
    </div>
  );
};

export default InteractiveGlobe;
