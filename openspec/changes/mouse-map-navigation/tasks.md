# Tasks: Independent Mouse Map Navigation and Zoom

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 260-360 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR; work-unit commits |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Add testable bounds and interaction contracts | PR 1 | `npx vitest run src/scenes/mapNavigation.test.ts` | N/A: no configured browser harness | Revert `src/scenes/mapNavigation.ts` and its unit tests |
| 2 | Wire independent controls and selection behavior | PR 1 | `npm test` | N/A: no configured Playwright/R3F harness; use manual browser checks | Revert the four scene/UI files and restore follow-rig behavior |

## Phase 1: Test Contracts (RED)

- [x] 1.1 Create `src/scenes/mapNavigation.test.ts` with failing tests for camera/target translation clamping, separation preservation, bounds, zoom constants, and zero/threshold/over-threshold drag deltas.

## Phase 2: Navigation Foundation (GREEN)

- [x] 2.1 Create `src/scenes/mapNavigation.ts` with scene-derived bounds, usable zoom limits, the documented drag threshold, and `clampCameraPair()` that translates both vectors equally.
- [x] 2.2 Run the focused Vitest command and refine the pure helper until every Phase 1 contract passes without changing vector separation.

## Phase 3: Scene and Interaction Wiring

- [x] 3.1 Modify `src/scenes/SpaceMapScene.tsx` to remove `SpaceMapCameraRig`, configure non-rotating Drei `OrbitControls` with pan/zoom limits, clamp camera and target on change, and update the map hint.
- [x] 3.2 Delete `src/scenes/components/SpaceMapCameraRig.tsx` after confirming no remaining imports or follow-loop ownership.
- [x] 3.3 Modify `src/scenes/components/PlanetNode.tsx` so textured and fallback clicks ignore events whose `event.delta` exceeds the shared threshold while intentional clicks still select.
- [x] 3.4 Modify `src/app/globals.css` so the navigation hint wraps and remains readable at narrow supported viewports.

## Phase 4: Verification and Refactor

- [x] 4.1 Add or adjust tests only if wiring exposes a missing contract; keep test-first coverage for boundaries and click-versus-drag behavior.
- [x] 4.2 Run `npm test`, `npm run lint`, and `npm run build`; manually verify desktop/mobile pan, zoom limits, ship independence, keyboard movement, proximity, planet clicks, and drag suppression. Automated commands pass; manual browser verification remains pending.
- [ ] 4.3 Refactor duplicated constants/guards, confirm type aliases and arrow functions, and record focused/runtime evidence for each work unit.
- [x] 4.4 Add the explicit map-controls/help section and an accessible reset button that uses the existing `OrbitControls` reset behavior.
