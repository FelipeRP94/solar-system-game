# Design: Independent Mouse Map Navigation and Zoom

## Technical Approach

Use Drei `OrbitControls` as the only camera owner. Remove the per-frame
`SpaceMapCameraRig` follow loop, enable horizontal/vertical pan and wheel zoom,
and lock rotation so dragging has one predictable meaning. Configure distance
limits for zoom and clamp the controls' translated camera/target pair to bounds
derived from `MAX_SCENE_DISTANCE`. Leave `Spaceship`, `useFreeFlightControls`,
and `onMove` unchanged, so keyboard movement and proximity detection retain
their current data flow.

## Architecture Decisions

| Decision | Alternatives considered | Rationale |
|---|---|---|
| `OrbitControls` owns camera state | Keep a follow rig; write a custom pointer controller | The proposal already selects the installed Drei primitive; one authority prevents the current `useFrame` follow loop from overwriting pan/zoom. |
| Clamp controls on their change callback | Unbounded controls; replace controls with bespoke math | Callback clamping preserves Drei's input, damping, and wheel behavior while enforcing scene limits without a new camera system. |
| Reject click events whose R3F `event.delta` exceeds a small pixel threshold | Global drag state; disable planet clicks during every control gesture | R3F already reports pointer travel on click, keeping selection local to both textured and fallback planet nodes and preserving intentional clicks. |

## Data Flow

```text
mouse drag / wheel
        -> OrbitControls -> camera + target -> bounded map view
keyboard -> useFreeFlightControls -> Spaceship -> ship ref/onMove
planet click -> PlanetNode event.delta guard -> selected planet state
```

`SpaceMapScene` supplies the controls configuration and receives no camera
position from the ship. The controls' change handler applies the same clamp to
the camera and target translation, preserving their relative offset while
preventing pan escape. Zoom uses `minDistance`/`maxDistance`; pan limits are
scene-space X/Z bounds with a small edge margin and a fixed usable Y range.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/scenes/SpaceMapScene.tsx` | Modify | Remove rig usage; configure bounded, non-rotating `OrbitControls`; update the Spanish hint with drag and wheel gestures. |
| `src/scenes/components/SpaceMapCameraRig.tsx` | Delete | Eliminate the competing ship-follow camera authority. |
| `src/scenes/components/PlanetNode.tsx` | Modify | Apply the same click-versus-drag guard to textured and fallback node handlers. |
| `src/app/globals.css` | Modify | Allow the hint to wrap and remain readable at narrow supported viewports. |
| `src/scenes/mapNavigation.ts` | Create | Export scene-bound constants and a pure camera/target clamp helper, keeping geometry rules testable. |
| `src/scenes/mapNavigation.test.ts` | Create | Unit-test pan clamping, zoom limits/constants, and the drag threshold contract. |

## Interfaces / Contracts

```ts
type MapNavigationBounds = {
  minX: number; maxX: number; minY: number; maxY: number;
  minZ: number; maxZ: number;
};

const clampCameraPair = (
  camera: THREE.Vector3,
  target: THREE.Vector3,
  bounds: MapNavigationBounds,
): void => { /* translate both by the required bounded delta */ };
```

The helper mutates both vectors only by the same translation and never changes
their separation. Planet selection occurs only when `event.delta` is at or
below the documented threshold; drag events still propagate to controls.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Bound clamping and camera/target offset preservation | Vitest pure-function tests using Three vectors. |
| Unit | Click threshold contract | Vitest boundary tests for zero, threshold, and over-threshold travel. |
| Manual | Pan/zoom limits, ship independence, planet click/drag, desktop/mobile | Browser verification; the repository has no R3F integration or configured Playwright suite. |
| Regression | Existing domain behavior | Run `npm test`, `npm run lint`, and `npm run build` in verification. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file
classification, or process-integration boundary.

## Migration / Rollout

No migration or feature flag required. Roll back by restoring the rig,
disabling OrbitControls pan/zoom, and reverting the hint and click guard.

## Open Questions

- [ ] Confirm final edge margin and zoom distances during desktop and mobile
  manual verification; they are presentation calibration, not API changes.
