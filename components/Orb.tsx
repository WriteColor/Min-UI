"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface OrbProps {
  state: "LISTENING" | "THINKING" | "SPEAKING" | "MUTED" | "SUSPENDED" | "OFFLINE";
  volume: number;
}

const PALETTES: Record<string, { PRI: string; PRI_DIM: string; TEXT: string; BG: string; ALT: string }> = {
  LISTENING: { PRI: '#a855f7', PRI_DIM: '#4c1d95', TEXT: '#e9d5ff', BG: '#07020f', ALT: '#818cf8' },
  THINKING:  { PRI: '#7c3aed', PRI_DIM: '#3b0764', TEXT: '#ddd6fe', BG: '#050210', ALT: '#a78bfa' },
  SPEAKING:  { PRI: '#c026d3', PRI_DIM: '#701a75', TEXT: '#f0abfc', BG: '#080010', ALT: '#e879f9' },
  MUTED:     { PRI: '#6b21a8', PRI_DIM: '#2e1065', TEXT: '#c4b5fd', BG: '#050208', ALT: '#7c3aed' },
  SUSPENDED: { PRI: '#f59e0b', PRI_DIM: '#78350f', TEXT: '#fef3c7', BG: '#0a0800', ALT: '#fbbf24' },
  OFFLINE:   { PRI: '#374151', PRI_DIM: '#1f2937', TEXT: '#9ca3af', BG: '#0a0a0a', ALT: '#4b5563' },
};

export default function Orb({ state, volume }: OrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  const stateRef = useRef(state);
  const volumeRef = useRef(volume);

  stateRef.current = state;
  volumeRef.current = volume;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const w = container.clientWidth || 320;
    const h = container.clientHeight || 320;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 5;

    const group = new THREE.Group();
    scene.add(group);

    let themeColors = { ...PALETTES.LISTENING };
    let targetPalette = { ...PALETTES.LISTENING };
    let lerpColors = { ...PALETTES.LISTENING };
    let lerpT = 1.0;

    const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: new THREE.Color(themeColors.PRI),
      emissiveIntensity: 0.55,
      shininess: 130,
      transparent: true,
      opacity: 0.90,
    });
    group.add(new THREE.Mesh(coreGeo, coreMat));

    const coreWireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(themeColors.PRI),
      wireframe: true,
      transparent: true,
      opacity: 0.09,
    });
    group.add(new THREE.Mesh(coreGeo, coreWireMat));

    const midGeo = new THREE.OctahedronGeometry(1.08, 2);
    const midMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(themeColors.PRI),
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    group.add(new THREE.Mesh(midGeo, midMat));

    const outerGeo = new THREE.IcosahedronGeometry(1.42, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(themeColors.ALT),
      wireframe: true,
      transparent: true,
      opacity: 0.09,
    });
    group.add(new THREE.Mesh(outerGeo, outerMat));

    const ringGeo = new THREE.TorusGeometry(1.28, 0.012, 8, 96);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(themeColors.PRI), transparent: true, opacity: 0.55 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    group.add(ringMesh);

    const ring2Geo = new THREE.TorusGeometry(1.38, 0.008, 8, 96);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(themeColors.ALT), transparent: true, opacity: 0.30 });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 3;
    ring2Mesh.rotation.y = Math.PI / 5;
    group.add(ring2Mesh);

    const NODE_COUNT = 90;
    const nPos: number[] = [];
    const nSizes: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.05 + (Math.random() - 0.5) * 0.25;
      nPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      nSizes.push(0.018 + Math.random() * 0.028);
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nPos, 3));
    nodeGeo.setAttribute('size', new THREE.Float32BufferAttribute(nSizes, 1));

    const nodeVert = `
      attribute float size;
      varying float vDepth;
      varying vec3 vPos;
      void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        vDepth=clamp((-mv.z+3.0)/6.0,0.0,1.0);
        vPos=position;
        gl_PointSize=size*220.0*vDepth;
        gl_Position=projectionMatrix*mv;
      }
    `;
    const nodeFrag = `
      uniform vec3  uColorA;
      uniform vec3  uColorB;
      uniform float uOpacity;
      varying float vDepth;
      varying vec3  vPos;
      void main(){
        float d=distance(gl_PointCoord,vec2(0.5));
        if(d>0.5) discard;
        float t=clamp((vPos.y+1.5)/3.0,0.0,1.0);
        vec3 col=mix(uColorA,uColorB,t);
        float alpha=(1.0-d*2.0)*vDepth*uOpacity;
        gl_FragColor=vec4(col,alpha);
      }
    `;
    const nodeMat = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(themeColors.PRI) },
        uColorB: { value: new THREE.Color(themeColors.ALT) },
        uOpacity: { value: 0.9 },
      },
      vertexShader: nodeVert,
      fragmentShader: nodeFrag,
      transparent: true,
      depthWrite: false,
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    group.add(nodePoints);

    const CONNECTIONS_PER_NODE = 3;
    const linePositions: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const ix = nPos[i * 3];
      const iy = nPos[i * 3 + 1];
      const iz = nPos[i * 3 + 2];
      const neighbors: { idx: number; dist: number }[] = [];
      for (let j = 0; j < NODE_COUNT; j++) {
        if (i === j) continue;
        const jx = nPos[j * 3];
        const jy = nPos[j * 3 + 1];
        const jz = nPos[j * 3 + 2];
        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        neighbors.push({ idx: j, dist: dx * dx + dy * dy + dz * dz });
      }
      neighbors.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < Math.min(CONNECTIONS_PER_NODE, neighbors.length); k++) {
        const j = neighbors[k].idx;
        if (j <= i) continue;
        const jx = nPos[j * 3];
        const jy = nPos[j * 3 + 1];
        const jz = nPos[j * 3 + 2];
        linePositions.push(ix, iy, iz, jx, jy, jz);
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(themeColors.PRI),
      transparent: true,
      opacity: 0.18,
    });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lineMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(new THREE.Color(themeColors.PRI), 2.5, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);
    const rimLight = new THREE.PointLight(new THREE.Color(themeColors.PRI_DIM), 1.2, 10);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    const applyColors = (c: { PRI: string; ALT: string; PRI_DIM: string }) => {
      coreMat.emissive.set(c.PRI);
      coreWireMat.color.set(c.PRI);
      midMat.color.set(c.PRI);
      outerMat.color.set(c.ALT);
      ringMat.color.set(c.PRI);
      ring2Mat.color.set(c.ALT);
      nodeMat.uniforms.uColorA.value.set(c.PRI);
      nodeMat.uniforms.uColorB.value.set(c.ALT);
      lineMat.color.set(c.PRI);
      pointLight.color.set(c.PRI);
      rimLight.color.set(c.PRI_DIM);
    };

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let userRotX = 0;
    let userRotY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      userRotY += (e.clientX - prevMouse.x) * 0.012;
      userRotX += (e.clientY - prevMouse.y) * 0.012;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const autoSpeeds: Record<string, { y: number; x: number }> = {
      LISTENING: { y: 0.0032, x: 0.0012 },
      THINKING:  { y: 0.007,  x: 0.0022 },
      SPEAKING:   { y: 0.0024, x: 0.0008 },
      MUTED:      { y: 0.0003, x: 0.00008 },
      SUSPENDED:  { y: 0.0005, x: 0.0001 },
      OFFLINE:    { y: 0.0001, x: 0.00003 },
    };
    let autoRotY = 0, autoRotX = 0;

    let smoothedVolume = 0.0;
    let _volFollow = 0.0;
    let bouncePos = 1.0;
    let lastTime = 0;
    const clock = new THREE.Timer();

    const triggerRipple = () => {
      const el = document.createElement("div");
      el.className = "ripple";
      el.style.left = el.style.top = "50%";
      el.style.borderColor = themeColors.PRI;
      container.appendChild(el);
      setTimeout(() => el.remove(), 1500);

      if (nodePoints) {
        const sizes = nodePoints.geometry.attributes.size.array as Float32Array;
        for (let i = 0; i < sizes.length; i++) {
          if (Math.random() > 0.6) sizes[i] = 0.09;
        }
        nodePoints.geometry.attributes.size.needsUpdate = true;
        setTimeout(() => {
          if (!nodePoints) return;
          const s2 = nodePoints.geometry.attributes.size.array as Float32Array;
          for (let i = 0; i < s2.length; i++) s2[i] = nSizes[i];
          nodePoints.geometry.attributes.size.needsUpdate = true;
        }, 220);
      }
    };

    const createFloatingParticle = () => {
      const p = document.createElement("div");
      p.className = "data-particle";
      const pW = container.clientWidth || 320;
      const pH = container.clientHeight || 320;
      const r = Math.min(pW, pH) * 0.38;
      p.style.left = (pW / 2 + (Math.random() - 0.5) * r * 1.8) + "px";
      p.style.top = (pH / 2 + (Math.random() - 0.5) * r * 1.8) + "px";
      p.style.background = themeColors.PRI;
      p.style.boxShadow = `0 0 6px ${themeColors.PRI}, 0 0 12px ${themeColors.ALT}`;
      container.appendChild(p);

      const dur = 1200 + Math.random() * 2000;
      const anim = p.animate([
        { transform: "translate(0,0) scale(1)", opacity: 0 },
        { transform: `translate(${(Math.random() - 0.5) * 100}px, -80px) scale(1.4)`, opacity: 0.85, offset: 0.5 },
        { transform: `translate(${(Math.random() - 0.5) * 200}px, -180px) scale(0)`, opacity: 0 }
      ], { duration: dur, easing: "ease-out" });
      anim.onfinish = () => p.remove();
    };

    const lerpHex = (a: string, b: string, t: number) => {
      const ca = new THREE.Color(a);
      const cb = new THREE.Color(b);
      ca.lerp(cb, t);
      return "#" + ca.getHexString();
    };

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      const t = clock.getElapsed();
      const dt = Math.min(t - lastTime, 0.05);
      lastTime = t;

      const currentState = stateRef.current;
      const currentVolume = volumeRef.current;

      const targetColors = PALETTES[currentState] || PALETTES.LISTENING;
      if (JSON.stringify(targetColors) !== JSON.stringify(targetPalette)) {
        targetPalette = { ...targetColors };
        lerpT = 0;
      }

      if (lerpT < 1) {
        lerpT = Math.min(1, lerpT + 0.028);
        const s = 0.028;
        lerpColors.PRI = lerpHex(lerpColors.PRI, targetPalette.PRI, s);
        lerpColors.PRI_DIM = lerpHex(lerpColors.PRI_DIM, targetPalette.PRI_DIM, s);
        lerpColors.ALT = lerpHex(lerpColors.ALT, targetPalette.ALT, s);
        applyColors(lerpColors);
      }

      const spd = autoSpeeds[currentState] || autoSpeeds.LISTENING;
      autoRotY += spd.y;
      autoRotX += spd.x;

      group.rotation.y = autoRotY + userRotY;
      group.rotation.x = autoRotX + userRotX;

      const clamped = Math.max(0, Math.min(1, currentVolume));
      const valpha = clamped > smoothedVolume ? 0.06 : 0.04;
      smoothedVolume += (clamped - smoothedVolume) * valpha;
      const finalVolume = smoothedVolume * 0.60;

      let scaleTarget = 1.0;
      let coreEmissive = 0.55;

      if (currentState === "MUTED") {
        coreEmissive = 0.15;
        midMat.opacity = 0.06;
        outerMat.opacity = 0.03;
        nodeMat.uniforms.uOpacity.value = 0.28;
        pointLight.intensity = 0.5;
        scaleTarget = 0.95;
      } else if (currentState === "THINKING") {
        const tp1 = Math.sin(t * 3.8);
        const tp2 = Math.sin(t * 11.0) * 0.4;
        scaleTarget = 1.025 + tp1 * 0.030 + tp2 * 0.008;
        coreEmissive = 1.0 + tp1 * 0.12;
        midMat.opacity = 0.44 + Math.sin(t * 5.0) * 0.06;
        outerMat.opacity = 0.26 + Math.sin(t * 7.0) * 0.05;
        nodeMat.uniforms.uOpacity.value = 1.20 + tp2 * 0.08;
        pointLight.intensity = 4.0 + Math.abs(tp1) * 0.8;
      } else if (currentState === "SPEAKING") {
        const attack = 1.0 - Math.exp(-dt * 8.0);
        const release = 1.0 - Math.exp(-dt * 2.5);
        const alpha = finalVolume > _volFollow ? attack : release;
        _volFollow += (finalVolume - _volFollow) * alpha;

        const target = 1.0 + _volFollow * 0.08;
        bouncePos += (target - bouncePos) * (1.0 - Math.exp(-dt * 10.0));
        scaleTarget = Math.max(0.97, Math.min(1.08, bouncePos));

        coreEmissive = 0.62 + finalVolume * 0.20;
        midMat.opacity = 0.20 + finalVolume * 0.10;
        outerMat.opacity = 0.10 + finalVolume * 0.07;
        nodeMat.uniforms.uOpacity.value = 0.78 + finalVolume * 0.18;
        pointLight.intensity = 2.0 + finalVolume * 0.6;
      } else if (currentState === "SUSPENDED") {
        const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;
        scaleTarget = 1.0 + pulse * 0.015;
        coreEmissive = 0.45 + pulse * 0.15;
        midMat.opacity = 0.15 + pulse * 0.08;
        outerMat.opacity = 0.07 + pulse * 0.05;
        nodeMat.uniforms.uOpacity.value = 0.5 + pulse * 0.2;
        pointLight.intensity = 1.5 + pulse * 0.8;
      } else if (currentState === "OFFLINE") {
        coreEmissive = 0.1;
        midMat.opacity = 0.03;
        outerMat.opacity = 0.02;
        nodeMat.uniforms.uOpacity.value = 0.15;
        pointLight.intensity = 0.3;
        scaleTarget = 0.92;
      } else {
        const w1 = Math.sin(t * 1.3);
        const w2 = Math.sin(t * 2.9 + 0.8);
        scaleTarget = 1.0 + w1 * 0.022 + w2 * 0.010;
        coreEmissive = 0.58 + w1 * 0.12 + w2 * 0.04;
        midMat.opacity = 0.22 + Math.sin(t * 1.7 + 0.3) * 0.06;
        outerMat.opacity = 0.10 + Math.sin(t * 2.1 + 1.1) * 0.04;
        nodeMat.uniforms.uOpacity.value = 0.86 + Math.sin(t * 1.5) * 0.10;
        pointLight.intensity = 2.6 + Math.sin(t * 1.8) * 0.5;
      }

      const cs = group.scale.x;
      const lerpSpeed = currentState === "SPEAKING" ? 0.18 : 0.10;
      group.scale.setScalar(cs + (scaleTarget - cs) * lerpSpeed);
      coreMat.emissiveIntensity = coreEmissive;

      const im = currentState === "MUTED" ? 0.25 : currentState === "THINKING" ? 2.5 : currentState === "SPEAKING" ? 1.6 : 1.2;
      ringMesh.rotation.z += 0.005 * im;
      ring2Mesh.rotation.z -= 0.003 * im;
      ring2Mesh.rotation.x += 0.0018 * im;

      let lineOpacity = 0.12;
      if (currentState === "MUTED") {
        lineOpacity = 0.05;
      } else if (currentState === "THINKING") {
        lineOpacity = 0.22;
      } else if (currentState === "SPEAKING") {
        lineOpacity = 0.12 + finalVolume * 0.25;
      } else if (currentState === "SUSPENDED") {
        lineOpacity = 0.10 + Math.sin(t * 1.5) * 0.03;
      } else if (currentState === "OFFLINE") {
        lineOpacity = 0.04;
      } else {
        lineOpacity = 0.14 + Math.sin(t * 1.5) * 0.04;
      }
      lineMat.opacity = Math.max(0.04, Math.min(0.5, lineOpacity));

      if (currentState !== "MUTED" && currentState !== "OFFLINE") {
        const ch = currentState === "THINKING" ? 0.40
          : currentState === "SPEAKING" ? 0.60
          : currentState === "SUSPENDED" ? 0.85
          : 0.985;
        if (Math.random() > ch) createFloatingParticle();
      }

      if (currentState === "THINKING" && Math.random() > 0.97) {
        triggerRipple();
      }
      if (currentState === "SPEAKING" && finalVolume > 0.42 && Math.random() > 0.96) {
        triggerRipple();
      }
      if (currentState === "SUSPENDED" && Math.random() > 0.985) {
        triggerRipple();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const wWidth = container.clientWidth || 320;
      const wHeight = container.clientHeight || 320;
      renderer.setSize(wWidth, wHeight);
      camera.aspect = wWidth / wHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      try { container.removeChild(renderer.domElement); } catch { /* ignore */ }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ backgroundColor: "#000", position: "relative", overflow: "hidden" }}
    />
  );
}
