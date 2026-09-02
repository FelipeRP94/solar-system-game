## Exploration: Mouse map navigation and zoom

### Current State

The playable map is rendered by `src/scenes/SpaceMapScene.tsx` using React Three Fiber's `Canvas`. The scene mounts `OrbitControls` with both `enablePan={false}` and `enableZoom={false}`, so mouse navigation and wheel zoom are explicitly disabled. `SpaceMapCameraRig` continuously lerps the camera toward the spaceship ref and calls `camera.lookAt(target.current)` every frame, making the camera follow ship movement. The ship itself moves only from keyboard input (`WASD`, with `Q/E` for vertical movement and `Shift` for turbo) through `src/scenes/hooks/useFreeFlightControls.ts` and reports its position back to `SpaceMapScene` for proximity detection.

The map is bounded by the ship movement limits (`x: -45..45`, `y: -18..18`, `z: -45..45`), while planet positions are generated in scene space up to `MAX_SCENE_DISTANCE = 42` by `src/domain/ephemeris/distanceScale.ts`. There are no scene or camera interaction tests; the existing Vitest suite covers distance scaling, planet texture manifests, and quiz logic only. `@react-three/drei` is already a dependency, so the existing `OrbitControls` requires no new package.

### Affected Areas

- `src/scenes/SpaceMapScene.tsx` — enable mouse pan/zoom, define camera control limits and interaction behavior, and resolve the current conflict between `OrbitControls` and the automatic camera-follow rig.
- `src/scenes/components/SpaceMapCameraRig.tsx` — likely remove, replace, or make conditional because its per-frame `lookAt` and position interpolation override independent mouse navigation.
- `src/scenes/hooks/useFreeFlightControls.ts` — remains the keyboard ship controller; it should not be coupled to camera navigation unless the product intentionally adds a camera-follow toggle.
- `src/scenes/components/PlanetNode.tsx` — existing click selection may need drag-versus-click validation so panning does not accidentally open a planet panel.
- `src/app/globals.css` — potentially update the map legend/hint to communicate mouse drag and wheel controls; `.space-map canvas` already fills the viewport and the header uses `pointer-events: none`.
- `src/scenes/components/Spaceship.tsx` — remains the ship renderer and movement source; no direct feature change is required. The worktree currently contains unrelated uncommitted texture changes in this file and they must be preserved.
- `src/scenes/*.test.ts`, new camera-control tests if feasible — current tests do not exercise R3F controls or pointer gestures, so interaction acceptance will require browser/manual verification unless a focused controller abstraction is introduced.

### Approaches

1. **Use `OrbitControls` as the map camera controller** — enable panning and zooming, remove the automatic `SpaceMapCameraRig` from this scene (or replace it with one-time camera initialization), and constrain distance/target movement to the solar-system map.
   - Pros: uses an installed, battle-tested Drei control; minimal implementation; supports mouse drag and wheel natively; keeps ship movement independent from camera movement.
   - Cons: requires carefully choosing perspective, polar-angle, distance, and pan bounds; camera target semantics need validation against the flat XZ map; click-versus-drag behavior must be checked.
   - Effort: Medium

2. **Implement a custom pointer camera controller** — track pointer drag and wheel events, translate screen deltas into world-space camera/target movement, and add explicit bounds and gesture thresholds.
   - Pros: exact control over map-plane navigation, bounds, gestures, and click discrimination; easier to add future camera modes.
   - Cons: substantially more code and testing; must handle coordinate projection, touch/pointer capture, damping, resize, and camera clipping correctly; duplicates functionality already available in Drei.
   - Effort: High

3. **Keep the follow rig and add temporary manual override** — enable `OrbitControls`, suspend `SpaceMapCameraRig` after pointer input, and restore follow mode only through an explicit reset/follow action.
   - Pros: preserves the current ship-follow experience while allowing manual inspection; supports a future “follow ship” mode.
   - Cons: introduces two competing camera authorities and state transitions; reset semantics and ownership of `controls.target` are easy to make confusing; more UI and regression surface than the stated requirement needs.
   - Effort: High

### Recommendation

Adopt Approach 1. Make `OrbitControls` the sole camera authority for the map, enable pan and zoom, and remove the per-frame camera-follow behavior from the active scene. Configure bounded controls appropriate for the existing scene scale and retain the ship's keyboard movement and proximity logic unchanged. Update the on-map hint/legend with concise mouse instructions. Verify that planet selection still occurs on a click but not after a drag, and that overlays continue to block map input where intended. If a follow-ship mode is desired later, add it as an explicit camera state rather than allowing the rig and controls to fight each other.

### Risks

- Leaving `SpaceMapCameraRig` active will continuously overwrite camera position and orientation, effectively defeating or producing jitter with mouse pan/zoom.
- Unbounded pan or zoom can move the camera beyond the planets, inside geometry, or into unusable empty space; limits must be derived from the existing scene scale and tested at desktop and mobile viewport sizes.
- OrbitControls pointer events can turn a drag ending over a planet into an accidental selection unless click/drag discrimination is confirmed or added.
- The scene has no automated R3F interaction coverage, so camera gesture behavior and usability need manual browser verification; adding a controller abstraction would improve unit-testability but increases scope.
- Existing uncommitted changes in `src/scenes/components/Spaceship.tsx`, `.atl/`, `.codegraph/`, `openspec/`, and `public/textures/spaceship/` must not be overwritten or folded into this change accidentally.

### Ready for Proposal

Yes. The codebase and dependency set support a focused proposal centered on enabling Drei `OrbitControls` for independent map pan/zoom and removing the conflicting automatic camera-follow loop. The proposal should specify camera bounds, click-versus-drag behavior, input help copy, and the required manual verification cases before implementation.
