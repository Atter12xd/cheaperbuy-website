import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Definir países y coordenadas
interface Country {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  flag: string;
  description: string;
  descriptionEn: string;
}

const countries: Country[] = [
  {
    name: "Perú",
    nameEn: "Peru",
    lat: -9.19,
    lng: -75.0152,
    flag: "🇵🇪",
    description: "Sede principal - Huánuco",
    descriptionEn: "Main Office - Huánuco"
  },
  {
    name: "Estados Unidos",
    nameEn: "United States",
    lat: 39.8283,
    lng: -98.5795,
    flag: "🇺🇸",
    description: "Distribuidor oficial",
    descriptionEn: "Official Distributor"
  },
  {
    name: "México",
    nameEn: "Mexico",
    lat: 23.6345,
    lng: -102.5528,
    flag: "🇲🇽",
    description: "Distribuidor oficial",
    descriptionEn: "Official Distributor"
  },
  {
    name: "Canadá",
    nameEn: "Canada",
    lat: 56.1304,
    lng: -106.3468,
    flag: "🇨🇦",
    description: "Distribuidor oficial",
    descriptionEn: "Official Distributor"
  }
];

const EnhancedInteractiveGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const globeRef = useRef<THREE.Mesh>();
  const markersRef = useRef<THREE.Group>();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Función para convertir coordenadas lat/lng a posición 3D
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  };

  // Crear marcador de país
  const createCountryMarker = (country: Country, radius: number) => {
    const position = latLngToVector3(country.lat, country.lng, radius + 0.1);
    
    // Crear grupo para el marcador
    const markerGroup = new THREE.Group();
    
    // Marcador principal (punto brillante)
    const markerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: country.name === "Perú" ? 0xFFD700 : 0xFF6B6B,
      transparent: true,
      opacity: 0.9
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    
    // Anillo exterior animado
    const ringGeometry = new THREE.RingGeometry(0.12, 0.15, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: country.name === "Perú" ? 0xFFD700 : 0xFF6B6B,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    
    markerGroup.add(marker);
    markerGroup.add(ring);
    markerGroup.position.copy(position);
    
    // Orientar hacia el centro
    markerGroup.lookAt(new THREE.Vector3(0, 0, 0));
    
    // Añadir datos del país al grupo
    (markerGroup as any).countryData = country;
    
    return markerGroup;
  };

  // Crear líneas de conexión
  const createConnectionLines = (radius: number) => {
    const linesGroup = new THREE.Group();
    const peruPosition = latLngToVector3(countries[0].lat, countries[0].lng, radius);
    
    // Conectar Perú con otros países
    countries.slice(1).forEach(country => {
      const countryPosition = latLngToVector3(country.lat, country.lng, radius);
      
      // Crear curva bezier para línea arqueada
      const midPoint = new THREE.Vector3()
        .addVectors(peruPosition, countryPosition)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(radius + 1.5);
      
      const curve = new THREE.QuadraticBezierCurve3(peruPosition, midPoint, countryPosition);
      const points = curve.getPoints(50);
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x4ECDC4,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      
      const line = new THREE.Line(geometry, material);
      linesGroup.add(line);
    });
    
    return linesGroup;
  };

  // Manejar clic en marcadores
  const handleMarkerClick = (event: MouseEvent) => {
    if (!cameraRef.current || !rendererRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const rect = mountRef.current!.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraRef.current);

    if (markersRef.current) {
      const intersects = raycaster.intersectObjects(markersRef.current.children, true);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object.parent;
        const countryData = (clickedObject as any)?.countryData;
        
        if (countryData) {
          setSelectedCountry(countryData);
          setMousePosition({ x: event.clientX, y: event.clientY });
        }
      } else {
        setSelectedCountry(null);
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Configuración de la escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Cargar textura del globo
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/images/globe/joven.jpeg",
      (texture) => {
        texture.offset.x = -0.1;
        
        // Material del globo mejorado
        const globeMaterial = new THREE.MeshPhongMaterial({
          map: texture,
          shininess: 100,
          transparent: true,
          opacity: 0.95
        });

        const globeGeometry = new THREE.SphereGeometry(3.8, 64, 64);
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        globe.castShadow = true;
        globe.receiveShadow = true;
        scene.add(globe);
        globeRef.current = globe;

        // Crear marcadores
        const markersGroup = new THREE.Group();
        countries.forEach(country => {
          const marker = createCountryMarker(country, 3.8);
          markersGroup.add(marker);
        });
        scene.add(markersGroup);
        markersRef.current = markersGroup;

        // Crear líneas de conexión
        const linesGroup = createConnectionLines(3.8);
        scene.add(linesGroup);

        // Iluminación mejorada
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Luz puntual para destacar marcadores
        const pointLight = new THREE.PointLight(0x4ECDC4, 0.5, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Agregar estrellas de fondo
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
          const x = (Math.random() - 0.5) * 2000;
          const y = (Math.random() - 0.5) * 2000;
          const z = (Math.random() - 0.5) * 2000;
          starsVertices.push(x, y, z);
        }
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Controles de mouse mejorados
        let mouseX = 0, mouseY = 0;
        let isMouseDown = false;

        const onMouseMove = (event: MouseEvent) => {
          if (!isMouseDown) {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
          }
        };

        const onMouseDown = () => {
          isMouseDown = true;
        };

        const onMouseUp = () => {
          isMouseDown = false;
        };

        // Event listeners
        mountRef.current.addEventListener('click', handleMarkerClick);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        // Loop de animación
        let animationTime = 0;
        const animate = () => {
          requestAnimationFrame(animate);
          animationTime += 0.01;

          // Rotación suave del globo
          if (globe) {
            globe.rotation.y += 0.002;
          }

          // Animación de marcadores
          if (markersRef.current) {
            markersRef.current.children.forEach((marker, index) => {
              const scale = 1 + Math.sin(animationTime * 2 + index) * 0.1;
              marker.scale.setScalar(scale);
            });
          }

          // Movimiento suave basado en mouse
          if (!isMouseDown) {
            camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
            camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);
          }

          renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
          mountRef.current?.removeEventListener('click', handleMarkerClick);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mousedown', onMouseDown);
          window.removeEventListener('mouseup', onMouseUp);
        };
      },
      undefined,
      (error) => console.error("Error loading globe texture:", error)
    );

    // Manejar redimensionamiento
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-move" />
      
      {/* Título superior */}
      <div className="absolute top-6 left-6 right-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🌍</span>
          <h3 className="text-white text-xl font-bold">
            Nos encontramos en los siguientes países
          </h3>
        </div>
        <p className="text-gray-300 text-sm">
          Haz clic en los marcadores para más información
        </p>
      </div>

      {/* Tooltip de país */}
      {selectedCountry && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 80,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedCountry.flag}</span>
            <h4 className="font-bold text-gray-800 dark:text-white">
              {selectedCountry.name}
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {selectedCountry.description}
          </p>
        </div>
      )}

      {/* Indicadores de países */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {countries.map((country, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-white text-sm cursor-pointer hover:bg-white/10 rounded p-2 transition-colors"
                onClick={() => setSelectedCountry(country)}
              >
                <span className="text-lg">{country.flag}</span>
                <div>
                  <div className="font-medium">{country.name}</div>
                  <div className="text-xs text-gray-300">{country.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInteractiveGlobe;