import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Color palette for vectors (by index)
const COLOR_PALETTE = [
  0xff7f50,  // coral/orange
  0xffd700,  // gold
  0x4ade80,  // green
  0x60a5fa,  // blue
  0xa78bfa,  // purple
  0xf472b6   // pink
]

// Get color by vector index
function getVectorColor(vectors, word) {
  const keys = Object.keys(vectors)
  const index = keys.indexOf(word)
  return COLOR_PALETTE[index % COLOR_PALETTE.length]
}

export default function VectorSpace3D({
  vectors,
  selectedPair,
  metricType,
  metricValue,
  highlight,
  cameraState,
  onCameraChange,
  magnitudeScale = 1
}) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const animationIdRef = useRef(null)

  // Scale vectors for display
  const scale = 1.5

  // Create arrow helper
  const createArrow = (start, end, color, lineWidth = 2) => {
    const direction = new THREE.Vector3().subVectors(end, start)
    const length = direction.length()
    direction.normalize()

    const arrowHelper = new THREE.ArrowHelper(
      direction,
      start,
      length,
      color,
      0.15,
      0.08
    )
    return arrowHelper
  }

  // Create axis lines
  const createAxes = () => {
    const group = new THREE.Group()
    const axisLength = 2

    // X axis (red)
    const xGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLength, 0, 0),
      new THREE.Vector3(axisLength, 0, 0)
    ])
    const xMat = new THREE.LineBasicMaterial({ color: 0x555555 })
    group.add(new THREE.Line(xGeom, xMat))

    // Y axis (green)
    const yGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -axisLength, 0),
      new THREE.Vector3(0, axisLength, 0)
    ])
    const yMat = new THREE.LineBasicMaterial({ color: 0x555555 })
    group.add(new THREE.Line(yGeom, yMat))

    // Z axis (blue)
    const zGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLength),
      new THREE.Vector3(0, 0, axisLength)
    ])
    const zMat = new THREE.LineBasicMaterial({ color: 0x555555 })
    group.add(new THREE.Line(zGeom, zMat))

    return group
  }

  // Create metric-specific visualization
  const createMetricVisual = (v1, v2, type) => {
    const group = new THREE.Group()
    const origin = new THREE.Vector3(0, 0, 0)
    const vec1 = new THREE.Vector3(v1[0] * scale, v1[1] * scale, v1[2] * scale)
    const vec2 = new THREE.Vector3(v2[0] * scale, v2[1] * scale, v2[2] * scale)

    switch (type) {
      case 'euclidean': {
        // Thick tube line between vector endpoints + endpoint markers
        const path = new THREE.LineCurve3(vec1, vec2)
        const tubeGeom = new THREE.TubeGeometry(path, 1, 0.04, 8, false)
        const tubeMat = new THREE.MeshBasicMaterial({
          color: 0xff7f50,
          transparent: true,
          opacity: 0.85
        })
        group.add(new THREE.Mesh(tubeGeom, tubeMat))

        // Endpoint markers
        const endSphere1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xff7f50 })
        )
        endSphere1.position.copy(vec1)
        group.add(endSphere1)

        const endSphere2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xff7f50 })
        )
        endSphere2.position.copy(vec2)
        group.add(endSphere2)
        break
      }

      case 'dot': {
        // Projection of v1 onto v2 with shaded triangle
        const v2Norm = vec2.clone().normalize()
        const projLength = vec1.dot(v2Norm)
        const projPoint = v2Norm.clone().multiplyScalar(projLength)

        // Shaded triangle from origin to vec1 to projection
        const triangleGeom = new THREE.BufferGeometry()
        const vertices = new Float32Array([
          0, 0, 0,
          vec1.x, vec1.y, vec1.z,
          projPoint.x, projPoint.y, projPoint.z
        ])
        triangleGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        const triangleMat = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide
        })
        group.add(new THREE.Mesh(triangleGeom, triangleMat))

        // Thick projection line (perpendicular drop)
        const projPath = new THREE.LineCurve3(vec1, projPoint)
        const projTube = new THREE.TubeGeometry(projPath, 1, 0.03, 8, false)
        group.add(new THREE.Mesh(projTube, new THREE.MeshBasicMaterial({ color: 0xffd700 })))

        // Projection point marker
        const projSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffd700 })
        )
        projSphere.position.copy(projPoint)
        group.add(projSphere)

        // Line from origin to projection point
        const originPath = new THREE.LineCurve3(origin, projPoint)
        const originTube = new THREE.TubeGeometry(originPath, 1, 0.015, 8, false)
        group.add(new THREE.Mesh(originTube, new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.5
        })))
        break
      }

      case 'cosine': {
        // Larger arc showing angle between vectors
        const arcRadius = 0.6
        const segments = 32
        const arcPoints = []

        const v1Norm = vec1.clone().normalize()
        const v2Norm2 = vec2.clone().normalize()

        for (let i = 0; i <= segments; i++) {
          const t = i / segments
          const point = new THREE.Vector3()
          point.lerpVectors(v1Norm, v2Norm2, t)
          point.normalize().multiplyScalar(arcRadius)
          arcPoints.push(point)
        }

        // Create tube for arc line (much more visible than LineBasicMaterial)
        const arcCurve = new THREE.CatmullRomCurve3(arcPoints)
        const arcTubeGeom = new THREE.TubeGeometry(arcCurve, 32, 0.025, 8, false)
        const arcTubeMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 })
        group.add(new THREE.Mesh(arcTubeGeom, arcTubeMat))

        // Fill the arc sector with higher opacity
        const sectorGeom = new THREE.BufferGeometry()
        const sectorVerts = [0, 0, 0]
        arcPoints.forEach(p => sectorVerts.push(p.x, p.y, p.z))
        sectorGeom.setAttribute('position', new THREE.Float32BufferAttribute(sectorVerts, 3))

        const indices = []
        for (let i = 1; i < arcPoints.length; i++) {
          indices.push(0, i, i + 1)
        }
        sectorGeom.setIndex(indices)

        const sectorMat = new THREE.MeshBasicMaterial({
          color: 0x4ade80,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide
        })
        group.add(new THREE.Mesh(sectorGeom, sectorMat))

        // Add small spheres at arc endpoints
        const arcEnd1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x4ade80 })
        )
        arcEnd1.position.copy(arcPoints[0])
        group.add(arcEnd1)

        const arcEnd2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x4ade80 })
        )
        arcEnd2.position.copy(arcPoints[arcPoints.length - 1])
        group.add(arcEnd2)
        break
      }

      case 'manhattan': {
        // RGB-colored step-wise path along axes
        const p1 = vec1.clone()
        const p2 = new THREE.Vector3(vec2.x, vec1.y, vec1.z)
        const p3 = new THREE.Vector3(vec2.x, vec2.y, vec1.z)
        const p4 = vec2.clone()

        // X segment (red)
        if (p1.distanceTo(p2) > 0.01) {
          const xPath = new THREE.LineCurve3(p1, p2)
          const xTube = new THREE.TubeGeometry(xPath, 1, 0.035, 8, false)
          group.add(new THREE.Mesh(xTube, new THREE.MeshBasicMaterial({ color: 0xff6b6b })))
        }

        // Y segment (green)
        if (p2.distanceTo(p3) > 0.01) {
          const yPath = new THREE.LineCurve3(p2, p3)
          const yTube = new THREE.TubeGeometry(yPath, 1, 0.035, 8, false)
          group.add(new THREE.Mesh(yTube, new THREE.MeshBasicMaterial({ color: 0x69db7c })))
        }

        // Z segment (blue)
        if (p3.distanceTo(p4) > 0.01) {
          const zPath = new THREE.LineCurve3(p3, p4)
          const zTube = new THREE.TubeGeometry(zPath, 1, 0.035, 8, false)
          group.add(new THREE.Mesh(zTube, new THREE.MeshBasicMaterial({ color: 0x74c0fc })))
        }

        // Corner markers
        const cornerMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const corners = [p2, p3]
        corners.forEach(corner => {
          const cornerSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            cornerMat
          )
          cornerSphere.position.copy(corner)
          group.add(cornerSphere)
        })
        break
      }

      case 'jaccard': {
        // Larger wireframe spheres at endpoints + intersection marker
        const sphere1Geom = new THREE.SphereGeometry(0.35, 16, 16)
        const sphere1Mat = new THREE.MeshBasicMaterial({
          color: 0xff7f50,
          wireframe: true,
          transparent: true,
          opacity: 0.7
        })
        const s1 = new THREE.Mesh(sphere1Geom, sphere1Mat)
        s1.position.copy(vec1)
        group.add(s1)

        const sphere2Geom = new THREE.SphereGeometry(0.35, 16, 16)
        const sphere2Mat = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          wireframe: true,
          transparent: true,
          opacity: 0.7
        })
        const s2 = new THREE.Mesh(sphere2Geom, sphere2Mat)
        s2.position.copy(vec2)
        group.add(s2)

        // Intersection marker at midpoint
        const midpoint = new THREE.Vector3().lerpVectors(vec1, vec2, 0.5)
        const intersectSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x4ade80 })
        )
        intersectSphere.position.copy(midpoint)
        group.add(intersectSphere)

        // Connecting line
        const connectPath = new THREE.LineCurve3(vec1, vec2)
        const connectTube = new THREE.TubeGeometry(connectPath, 1, 0.015, 8, false)
        group.add(new THREE.Mesh(connectTube, new THREE.MeshBasicMaterial({
          color: 0x4ade80,
          transparent: true,
          opacity: 0.5
        })))
        break
      }

      case 'pearson': {
        // Centered vectors from centroid with ring marker
        const centroid = new THREE.Vector3()
          .addVectors(vec1, vec2)
          .multiplyScalar(0.5)

        // Larger centroid marker
        const centroidSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xa78bfa })
        )
        centroidSphere.position.copy(centroid)
        group.add(centroidSphere)

        // Ring around centroid
        const ringGeom = new THREE.TorusGeometry(0.2, 0.025, 8, 32)
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa })
        const ring = new THREE.Mesh(ringGeom, ringMat)
        ring.position.copy(centroid)
        group.add(ring)

        // Thick lines from centroid to each vector
        const cv1Path = new THREE.LineCurve3(centroid, vec1)
        const cv1Tube = new THREE.TubeGeometry(cv1Path, 1, 0.025, 8, false)
        group.add(new THREE.Mesh(cv1Tube, new THREE.MeshBasicMaterial({
          color: 0xa78bfa,
          transparent: true,
          opacity: 0.75
        })))

        const cv2Path = new THREE.LineCurve3(centroid, vec2)
        const cv2Tube = new THREE.TubeGeometry(cv2Path, 1, 0.025, 8, false)
        group.add(new THREE.Mesh(cv2Tube, new THREE.MeshBasicMaterial({
          color: 0xa78bfa,
          transparent: true,
          opacity: 0.75
        })))

        // Small spheres at vector endpoints
        const endSphere1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xa78bfa })
        )
        endSphere1.position.copy(vec1)
        group.add(endSphere1)

        const endSphere2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xa78bfa })
        )
        endSphere2.position.copy(vec2)
        group.add(endSphere2)
        break
      }
    }

    return group
  }

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.set(3, 2, 3)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2
    controls.maxDistance = 10

    // Sync camera changes
    controls.addEventListener('change', () => {
      if (onCameraChange) {
        onCameraChange({
          position: camera.position.clone(),
          target: controls.target.clone()
        })
      }
    })

    controlsRef.current = controls

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationIdRef.current)
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  // Sync camera from parent
  useEffect(() => {
    if (cameraState && cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(cameraState.position)
      controlsRef.current.target.copy(cameraState.target)
      controlsRef.current.update()
    }
  }, [cameraState])

  // Update scene when vectors or settings change
  useEffect(() => {
    if (!sceneRef.current) return

    const scene = sceneRef.current

    // Clear existing objects (except lights)
    while (scene.children.length > 0) {
      scene.remove(scene.children[0])
    }

    // Add axes
    scene.add(createAxes())

    // Add ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    // Add vectors as arrows
    const origin = new THREE.Vector3(0, 0, 0)
    Object.entries(vectors).forEach(([word, vec]) => {
      // Apply magnitude scale to first selected word
      let scaledVec = vec
      if (word === selectedPair[0] && magnitudeScale !== 1) {
        scaledVec = vec.map(v => v * magnitudeScale)
      }

      const endPoint = new THREE.Vector3(
        scaledVec[0] * scale,
        scaledVec[1] * scale,
        scaledVec[2] * scale
      )
      const color = getVectorColor(vectors, word)
      const isSelected = selectedPair.includes(word)

      const arrow = createArrow(origin, endPoint, color)
      arrow.line.material.linewidth = isSelected ? 3 : 1
      arrow.line.material.opacity = isSelected ? 1 : 0.5
      arrow.line.material.transparent = true
      scene.add(arrow)

      // Add label sprite
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 128
      canvas.height = 64
      ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(word, 64, 40)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMat = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.position.copy(endPoint).multiplyScalar(1.15)
      sprite.scale.set(0.5, 0.25, 1)
      scene.add(sprite)
    })

    // Add metric-specific visualization
    if (selectedPair[0] && selectedPair[1] && vectors[selectedPair[0]] && vectors[selectedPair[1]]) {
      let v1 = vectors[selectedPair[0]]
      let v2 = vectors[selectedPair[1]]

      // Apply magnitude scale to first vector
      if (magnitudeScale !== 1) {
        v1 = v1.map(v => v * magnitudeScale)
      }

      const metricVisual = createMetricVisual(v1, v2, metricType)
      scene.add(metricVisual)
    }

  }, [vectors, selectedPair, metricType, magnitudeScale])

  return (
    <div
      ref={containerRef}
      className="vector-space-3d"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
