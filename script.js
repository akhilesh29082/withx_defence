/* WITHX Defence Interactive Scripts */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Navigation & Mobile Menu Handler
  // ==========================================
  const header = document.getElementById('header');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');

  // Set active link based on URL filename / anchors
  const path = window.location.pathname;
  const page = path.split("/").pop() || 'index.html';
  
  if (page === 'index.html' || page === '' || page.includes('index') || !page.includes('.')) {
    // Scroll active link highlighter for homepage
    const sections = document.querySelectorAll('section[id]');
    
    const updateActiveLink = () => {
      let scrollY = window.pageYOffset;
      
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      updateActiveLink();
    });
    
    // Initial call
    setTimeout(updateActiveLink, 100);
  } else {
    // Highlighter for standalone pages
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === page) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Toggle Mobile Menu
  function toggleMobileMenu() {
    mobileMenuToggle.classList.toggle('active');
    const isOpen = mobileMenuToggle.classList.contains('active');
    mobileNav.style.display = isOpen ? 'flex' : 'none';
  }

  mobileMenuToggle.addEventListener('click', toggleMobileMenu);

  // Close Mobile Menu on link click
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      mobileNav.style.display = 'none';
    });
  });

  // ==========================================
  // 2. Scroll Reveal Animations (Intersection Observer)
  // ==========================================
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  
  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };
  
  const displayScrollElement = (element) => {
    element.classList.add('revealed');
  };
  
  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.15)) {
        displayScrollElement(el);
      }
    });
  };
  
  window.addEventListener('scroll', () => { 
    handleScrollAnimation();
  });
  
  // Initial check
  setTimeout(handleScrollAnimation, 150);


  // ==========================================
  // 3. Stats Count Up Animation
  // ==========================================
  const statsSection = document.getElementById('progress');
  const statNumbers = document.querySelectorAll('.stat-number');
  let animatedStats = false;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000; // ms
    const stepTime = Math.abs(Math.floor(duration / target));
    let current = 0;
    
    const timer = setInterval(() => {
      current += 1;
      el.textContent = current;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, Math.max(stepTime, 15));
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedStats) {
        statNumbers.forEach(num => countUp(num));
        animatedStats = true;
      }
    });
  }, { threshold: 0.3 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }


  // ==========================================
  // 4. Contact Form Handler
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      // Loading State
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Processing Secure Connection...</span><div class="spinner"></div>';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      // Simulate secure transmission API
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        // Clear fields
        contactForm.reset();
        
        // Show success state
        formStatus.textContent = 'SECURE TRANSMISSION SUCCESSFUL: Your message has been encrypted (AES-256) and delivered to the WITHX Engineering desk.';
        formStatus.classList.add('success');
        
        setTimeout(() => {
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }, 8000);

      }, 2000);
    });
  }


  // ==========================================
  // 5. Three.js Interactive Showcase Model
  // ==========================================
  const container = document.getElementById('canvas-container');
  if (container) {
    initThreeJS();
  }

  function initThreeJS() {
    let scene, camera, renderer;
    let droneGroup;
    let props = [];
    
    // Camera Lerping targets
    let targetCameraPosition = { x: 0, y: 1.5, z: 6 };
    let targetDroneRotation = { x: 0.1, y: 0, z: 0 };
    
    // Screen coords projection helper for HTML Hotspots
    const hotspotsData = {
      gimbal: { pos: new THREE.Vector3(0, -0.6, 0.7), el: document.querySelector('.hotspot-gimbal') },
      propellers: { pos: new THREE.Vector3(-1.8, 0.45, -1.2), el: document.querySelector('.hotspot-propellers') },
      airbag: { pos: new THREE.Vector3(-1.1, -0.2, 0), el: document.querySelector('.hotspot-airbag') },
      core: { pos: new THREE.Vector3(0, 0.1, 0), el: document.querySelector('.hotspot-core') },
      frame: { pos: new THREE.Vector3(1.1, 0.1, 0.8), el: document.querySelector('.hotspot-frame') }
    };

    // Component details content maps
    const componentInfo = {
      gimbal: {
        title: "3-Axis Optical Gimbal Unit",
        desc: "Equipped with custom long-wave thermal and optical sensors, providing high-precision image stabilization, autonomous tracking capabilities, and day/night targets capture.",
        specs: [
          { label: "Weight", val: "340g" },
          { label: "Spectral Band", val: "8-14μm LWIR" },
          { label: "Stabilization", val: "0.01° Precision" }
        ],
        camPos: { x: 0, y: -0.8, z: 3.2 },
        rot: { x: 0.2, y: 0.2, z: 0 }
      },
      propellers: {
        title: "Advanced Brushless Propulsion",
        desc: "Custom high-torque brushless motors paired with lightweight carbon-fiber propellers, offering peak efficiency, high wind-resistance, and silent operation profiles.",
        specs: [
          { label: "Max Thrust", val: "4.8kg per rotor" },
          { label: "Prop Material", val: "Toray T700 Carbon" },
          { label: "Acoustics", val: "58 dBA @ 5m" }
        ],
        camPos: { x: -2.0, y: 1.0, z: 3.5 },
        rot: { x: 0.25, y: -0.6, z: -0.1 }
      },
      airbag: {
        title: "Water-Activated Airbag Cell",
        desc: "Integrated water-detecting sensors trigger cold-gas inflation cylinders, deploying high-buoyancy flotation bladders within 120 milliseconds of maritime contact.",
        specs: [
          { label: "Deploy Speed", val: "120ms" },
          { label: "Buoyancy", val: "Up to 25kg" },
          { label: "Triggers", val: "Hydro-Sensors x4" }
        ],
        camPos: { x: -2.2, y: -0.2, z: 3.8 },
        rot: { x: 0.1, y: 1.1, z: 0 }
      },
      core: {
        title: "WITHX Autopilot & Compute Core",
        desc: "Triple-redundant IMUs combined with a high-performance onboard edge computer for real-time obstacle avoidance, visual inertial odometry, and encrypted mesh routing.",
        specs: [
          { label: "Processors", val: "275 TOPS AI Engine" },
          { label: "Encryption", val: "AES-256 GCM" },
          { label: "Redundancy", val: "Triple-Voting IMU" }
        ],
        camPos: { x: 0, y: 1.2, z: 2.8 },
        rot: { x: 0.45, y: 0, z: 0 }
      },
      frame: {
        title: "Monomodal Carbon Fiber Frame",
        desc: "A unified aerospace-grade carbon fiber structural lattice designed to absorb extreme high-impact forces while keeping structural weight to a minimum.",
        specs: [
          { label: "Material", val: "HexMC Carbon Composite" },
          { label: "Tensile Strength", val: "4900 MPa" },
          { label: "Max Load Limit", val: "Up to 10G" }
        ],
        camPos: { x: 1.8, y: 0.5, z: 3.8 },
        rot: { x: 0.15, y: -0.7, z: -0.1 }
      }
    };

    // 1. Setup Scene, Camera and Renderer
    scene = new THREE.Scene();
    
    // Match light theme background or transparent
    scene.background = null; 
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(targetCameraPosition.x, targetCameraPosition.y, targetCameraPosition.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 1.5, 15);
    blueLight.position.set(0, -1, 3);
    scene.add(blueLight);

    // 3. Programmatically Construct the Drone model
    droneGroup = new THREE.Group();
    droneGroup.rotation.x = targetDroneRotation.x;
    scene.add(droneGroup);

    // Common Materials
    const carbonMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.4, 
      metalness: 0.8 
    });
    
    const metalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, 
      roughness: 0.2, 
      metalness: 0.9 
    });
    
    const glowingBlueMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9
    });

    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.95,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.4
    });

    const airbagMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange
      roughness: 0.6,
      metalness: 0.1
    });

    const propellerMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.7,
      transparent: true,
      opacity: 0.8
    });

    // 3a. Central Body (Fuselage)
    const bodyGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8);
    bodyGeo.scale(1.2, 0.8, 1.2);
    const bodyMesh = new THREE.Mesh(bodyGeo, carbonMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    droneGroup.add(bodyMesh);
    
    // Fuselage top plate
    const topPlateGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.1, 8);
    const topPlate = new THREE.Mesh(topPlateGeo, metalMaterial);
    topPlate.position.y = 0.25;
    droneGroup.add(topPlate);

    // 3b. 4 Rotor Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);
    armGeo.rotateZ(Math.PI / 2); // align along X-axis
    
    const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    
    angles.forEach(angle => {
      const arm = new THREE.Mesh(armGeo, carbonMaterial);
      arm.position.x = Math.cos(angle) * 0.9;
      arm.position.z = Math.sin(angle) * 0.9;
      arm.rotation.y = -angle; // rotate around center
      arm.castShadow = true;
      droneGroup.add(arm);

      // Motor mount at the end of each arm
      const motorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8);
      const motor = new THREE.Mesh(motorGeo, metalMaterial);
      motor.position.set(Math.cos(angle) * 1.8, 0.2, Math.sin(angle) * 1.8);
      motor.castShadow = true;
      droneGroup.add(motor);

      // Propeller system
      const propGroup = new THREE.Group();
      propGroup.position.set(Math.cos(angle) * 1.8, 0.35, Math.sin(angle) * 1.8);
      
      const bladeGeo = new THREE.BoxGeometry(1.2, 0.015, 0.08);
      const blade1 = new THREE.Mesh(bladeGeo, propellerMaterial);
      const blade2 = blade1.clone();
      blade2.rotation.y = Math.PI / 2;
      
      propGroup.add(blade1);
      propGroup.add(blade2);
      
      droneGroup.add(propGroup);
      props.push(propGroup);
    });

    // 3c. Camera Gimbal Unit (Underneath front)
    const gimbalAssembly = new THREE.Group();
    gimbalAssembly.position.set(0, -0.4, 0.6);

    const gimbalArmGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const gimbalArm = new THREE.Mesh(gimbalArmGeo, metalMaterial);
    gimbalArm.rotation.x = Math.PI / 6;
    gimbalAssembly.add(gimbalArm);

    const sphereGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const gimbalSphere = new THREE.Mesh(sphereGeo, carbonMaterial);
    gimbalSphere.position.set(0, -0.2, 0.1);
    gimbalSphere.castShadow = true;
    gimbalAssembly.add(gimbalSphere);

    // Lens
    const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lens = new THREE.Mesh(lensGeo, lensMaterial);
    lens.position.set(0, -0.2, 0.3);
    gimbalAssembly.add(lens);

    droneGroup.add(gimbalAssembly);

    // 3d. Airbag Recovery Pods (On the sides)
    const leftPod = new THREE.Group();
    leftPod.position.set(-1.1, -0.15, 0);
    
    const podShellGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8);
    podShellGeo.rotateX(Math.PI / 2);
    const podShell = new THREE.Mesh(podShellGeo, metalMaterial);
    podShell.castShadow = true;
    leftPod.add(podShell);

    // Airbag orange capsule ends
    const airbagEndGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const airbagEnd1 = new THREE.Mesh(airbagEndGeo, airbagMaterial);
    airbagEnd1.position.z = 0.4;
    const airbagEnd2 = airbagEnd1.clone();
    airbagEnd2.position.z = -0.4;
    leftPod.add(airbagEnd1);
    leftPod.add(airbagEnd2);

    droneGroup.add(leftPod);

    const rightPod = leftPod.clone();
    rightPod.position.x = 1.1;
    droneGroup.add(rightPod);

    // 4. Mouse Drag Rotation Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      // Set target rotations based on drag delta
      targetDroneRotation.y += deltaMove.x * 0.007;
      targetDroneRotation.x += deltaMove.y * 0.007;
      
      // Limit x tilt
      targetDroneRotation.x = Math.max(-0.4, Math.min(0.8, targetDroneRotation.x));

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    });

    // Touch Support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;

      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };

      targetDroneRotation.y += deltaMove.x * 0.01;
      targetDroneRotation.x += deltaMove.y * 0.01;
      targetDroneRotation.x = Math.max(-0.4, Math.min(0.8, targetDroneRotation.x));

      previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    });

    // 5. Select Component Click Action
    const compButtons = document.querySelectorAll('.btn-select-comp');
    const hotspotButtons = document.querySelectorAll('.hotspot');
    const compTitle = document.getElementById('component-title');
    const compDesc = document.getElementById('component-description');
    const compSpecs = document.getElementById('component-specs');

    function selectComponent(id) {
      // Update sidebar details
      const data = componentInfo[id];
      if (!data) return;

      compTitle.style.opacity = 0;
      compDesc.style.opacity = 0;
      compSpecs.style.opacity = 0;

      setTimeout(() => {
        compTitle.textContent = data.title;
        compDesc.textContent = data.desc;
        
        // Build specs
        compSpecs.innerHTML = '';
        data.specs.forEach(spec => {
          const row = document.createElement('div');
          row.className = 'spec-row';
          row.innerHTML = `<span class="spec-label">${spec.label}</span><span class="spec-value">${spec.val}</span>`;
          compSpecs.appendChild(row);
        });

        compTitle.style.opacity = 1;
        compDesc.style.opacity = 1;
        compSpecs.style.opacity = 1;
      }, 200);

      // Highlight active UI buttons
      compButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-select') === id);
      });

      hotspotButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === id);
      });

      // Update ThreeJS Focus target
      targetCameraPosition = data.camPos;
      targetDroneRotation = data.rot;
    }

    // Connect button click
    compButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-select');
        selectComponent(id);
      });
    });

    // Connect Hotspot click
    hotspotButtons.forEach(hotspot => {
      hotspot.addEventListener('click', () => {
        const id = hotspot.getAttribute('data-target');
        selectComponent(id);
      });
    });

    // 6. Window Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Temp vector for projection
    const projVector = new THREE.Vector3();

    // 7. Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Spin Propellers
      props.forEach(prop => {
        prop.rotation.y += 0.35;
      });

      // Slow idle hover float when not dragging
      if (!isDragging) {
        // Idle Y rotation
        droneGroup.rotation.y += 0.003;
        
        // Float height oscillation
        droneGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.12;
      }

      // Smooth Lerping of Drone rotation (when dragging or focus shifts)
      if (isDragging) {
        droneGroup.rotation.x += (targetDroneRotation.x - droneGroup.rotation.x) * 0.15;
        droneGroup.rotation.y += (targetDroneRotation.y - droneGroup.rotation.y) * 0.15;
      } else {
        droneGroup.rotation.x += (targetDroneRotation.x - droneGroup.rotation.x) * 0.08;
        droneGroup.rotation.y += (targetDroneRotation.y - droneGroup.rotation.y) * 0.08;
      }

      // Smooth Lerping of Camera Position
      camera.position.x += (targetCameraPosition.x - camera.position.x) * 0.08;
      camera.position.y += (targetCameraPosition.y - camera.position.y) * 0.08;
      camera.position.z += (targetCameraPosition.z - camera.position.z) * 0.08;
      camera.lookAt(0, 0, 0);

      // Render Three.js
      renderer.render(scene, camera);

      // Project Hotspots onto screen HTML elements
      for (const key in hotspotsData) {
        const h = hotspotsData[key];
        
        // Get 3D position of target node
        projVector.copy(h.pos);
        
        // Apply drone group transformations
        projVector.applyMatrix4(droneGroup.matrixWorld);
        
        // Project to NDC space
        projVector.project(camera);
        
        // Check if item is in front of camera
        if (projVector.z <= 1) {
          // Convert NDC (-1 to 1) to screen percentage (0% to 100%)
          const x = (projVector.x * .5 + .5) * 100;
          const y = (-(projVector.y) * .5 + .5) * 100;
          
          h.el.style.left = `${x}%`;
          h.el.style.top = `${y}%`;
          h.el.style.display = 'flex';
        } else {
          h.el.style.display = 'none';
        }
      }
    }

    // Set CSS transition limits on sidebar details update
    compTitle.style.transition = 'opacity 0.2s ease';
    compDesc.style.transition = 'opacity 0.2s ease';
    compSpecs.style.transition = 'opacity 0.2s ease';

    // Start Loop
    animate();
  }

});
