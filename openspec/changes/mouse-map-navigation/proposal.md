# Proposal: Independent Mouse Map Navigation and Zoom

**Requested change:** `quiero poder moverme a traves del mapa con el raton, pudiendo hacer zoom y navegando por el sin necesidad de mover la nave`

## Intent

Allow players to inspect and navigate the solar-system map with the mouse independently of spaceship movement. Dragging should pan and the wheel should zoom, while keyboard controls continue to move the ship.

## Scope

### In Scope
- Enable bounded mouse pan and wheel zoom for the map camera.
- Remove the per-frame camera-follow conflict so camera navigation is independent.
- Preserve keyboard ship movement and proximity detection.
- Update the map hint/legend and validate click-versus-drag selection.

### Out of Scope
- A follow-ship toggle or other camera modes.
- Changes to spaceship movement, planet placement, or proximity rules.
- A custom pointer camera controller.

## Capabilities

### New Capabilities
- `mouse-map-navigation`: Pan and zoom the map camera independently from spaceship movement within scene-appropriate bounds.

### Modified Capabilities
- None.

## Approach

Use the existing Drei `OrbitControls` as the sole map camera authority. Enable pan and zoom, configure limits from the existing map and scene scale, and remove or replace the active `SpaceMapCameraRig` follow loop. Keep `useFreeFlightControls` unchanged. Ensure pointer dragging does not trigger accidental planet selection, and communicate mouse gestures in the existing map hint.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/scenes/SpaceMapScene.tsx` | Modified | Configure controls and eliminate competing follow behavior. |
| `src/scenes/components/SpaceMapCameraRig.tsx` | Modified/Removed | No longer override independent camera navigation. |
| `src/scenes/components/PlanetNode.tsx` | Modified | Preserve click selection while rejecting drag selection if needed. |
| `src/app/globals.css` | Modified | Communicate mouse navigation in the map hint if required. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Camera pan/zoom becomes unusable or unbounded. | Medium | Derive limits from scene scale and verify desktop/mobile viewports. |
| Dragging over a planet opens its panel. | Medium | Validate click-versus-drag behavior and add discrimination if necessary. |

## Rollback Plan

Revert the proposal implementation, restore the prior camera-follow configuration, and remove the mouse hint. Preserve unrelated working-tree changes, especially `Spaceship.tsx` and texture files.

## Dependencies

- Existing `@react-three/drei` `OrbitControls`; no new package is required.
- Manual browser verification because no R3F interaction suite currently exists.

## Success Criteria

- [ ] Mouse drag pans the bounded map without moving the spaceship.
- [ ] Mouse-wheel zoom works within usable camera limits.
- [ ] Keyboard ship movement and proximity detection remain unchanged.
- [ ] Planet clicks select reliably, while map drags do not accidentally select planets.
- [ ] Manual verification passes at desktop and mobile viewport sizes.
