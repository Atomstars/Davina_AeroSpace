# Hero drone model

Drop a GLTF/GLB drone model here named exactly:

    drone.glb

As soon as this file exists, the hero automatically swaps the procedural
(code-built) drone for your real 3D model — no code changes needed. The model
is auto-centred and auto-scaled to fit the scene, picks up the environment
reflections, and flies with the same hover + scroll-exit choreography.

If the file is missing or fails to load, the site falls back to the procedural
drone, so nothing breaks.

## Where to get a model
- A licensed/commissioned drone .glb (best for an investor-facing site).
- CC0 / royalty-free sources: Sketchfab (CC0 filter), Poly Pizza, Quaternius.
- Export as **.glb** (binary glTF), Draco compression optional.

Keep it lean (< ~5 MB, ideally < 50k triangles) so the hero stays smooth.
