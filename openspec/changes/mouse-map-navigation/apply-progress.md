# Apply Progress: Independent Mouse Map Navigation and Zoom

## Mode

Strict TDD.

## Completed Tasks

- [x] 1.1 Create `src/scenes/mapNavigation.test.ts` with failing tests for camera/target translation clamping, separation preservation, bounds, zoom constants, and zero/threshold/over-threshold drag deltas.
- [x] 2.1 Create `src/scenes/mapNavigation.ts` with scene-derived bounds, usable zoom limits, the documented drag threshold, and `clampCameraPair()` that translates both vectors equally.
- [x] 2.2 Run the focused Vitest command and refine the pure helper until every Phase 1 contract passes without changing vector separation.
- [x] 3.1 Modify `src/scenes/SpaceMapScene.tsx` to remove `SpaceMapCameraRig`, configure non-rotating Drei `OrbitControls` with pan/zoom limits, clamp camera and target on change, and update the map hint.
- [x] 3.2 Delete `src/scenes/components/SpaceMapCameraRig.tsx` after confirming no remaining imports or follow-loop ownership.
- [x] 3.3 Modify `src/scenes/components/PlanetNode.tsx` so textured and fallback clicks ignore events whose `event.delta` exceeds the shared threshold while intentional clicks still select.
- [x] 3.4 Modify `src/app/globals.css` so the navigation hint wraps and remains readable at narrow supported viewports.
- [x] 4.1 Add or adjust tests only if wiring exposes a missing contract; keep test-first coverage for boundaries and click-versus-drag behavior.
- [x] 4.4 Add the explicit map-controls/help section and an accessible reset button that uses the existing `OrbitControls` reset behavior.
- [x] 4.2 Run `npm test`, `npm run lint`, and `npm run build`; manually verify desktop/mobile pan, zoom limits, ship independence, keyboard movement, proximity, planet clicks, and drag suppression. Automated commands pass; manual browser verification remains pending.
- [ ] 4.3 Refactor duplicated constants/guards, confirm type aliases and arrow functions, and record focused/runtime evidence for each work unit.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `src/scenes/mapNavigation.test.ts` | Unit | N/A (new) | ✅ Written; focused run failed because `./mapNavigation` does not exist | ⏳ Deferred to task 2.2; production code was not written in this test-contract slice | ✅ Separate boundary and edge cases cover clamp, bounds, zoom ordering, and drag threshold branches | ✅ Clean test-only addition; no production refactor required |
| 2.1 | `src/scenes/mapNavigation.test.ts` | Unit | N/A (new production file) | ✅ Existing RED contract from 1.1 | ✅ Focused Vitest run: 4/4 passed | ✅ Four cases exercise translation, edge clamping, constants, and threshold branches | ✅ Pure helper keeps one shared translation and vector separation unchanged |
| 2.2 | `src/scenes/mapNavigation.test.ts` | Unit | N/A (new production file) | ✅ Preserved 1.1 RED evidence | ✅ Focused Vitest run: 1 file, 4 tests passed | ✅ Non-trivial boundary and alternate input paths passed | ✅ No further behavior-changing refactor required |
| 3.1 | `src/scenes/mapNavigation.test.ts` | Unit/structural | ✅ 5/5 focused baseline | ✅ Added controls configuration contract; focused run failed with missing export | ✅ Focused Vitest run: 1 file, 5 tests passed | ✅ Pan/zoom/rotation settings and existing clamp cases passed | ✅ Reused exported controls config and clamp helper |
| 3.2 | `src/scenes/mapNavigation.test.ts` | Unit/structural | ✅ 5/5 focused baseline | ➖ Structural deletion; no new runtime behavior contract | ✅ Focused Vitest run: 1 file, 5 tests passed | ➖ Structural deletion | ✅ Confirmed the only import was removed before deletion |
| 3.3 | `src/scenes/mapNavigation.test.ts` | Unit | ✅ 5/5 focused baseline | ✅ Shared threshold contract was written before handler wiring in task 1.1 | ✅ Focused Vitest run: 1 file, 5 tests passed | ✅ Zero, exact-threshold, and over-threshold paths passed | ✅ Both textured and fallback handlers use one shared guard |
| 3.4 | `src/scenes/mapNavigation.test.ts` | Unit/structural | ✅ 5/5 focused baseline | ➖ CSS-only behavior; no executable contract available | ✅ Focused Vitest run: 1 file, 5 tests passed | ➖ CSS-only behavior | ✅ Added bounded width and readable line height without restyling |
| 4.1 | `src/scenes/mapNavigation.test.ts` | Unit | ✅ 5/5 focused baseline | ✅ Added rotation and explicit mouse-button mapping contract; focused run failed against non-rotating config | ✅ Focused Vitest run: 1 file, 6 tests passed | ✅ Separate assertions cover complete mapping and distinct left/right/middle gesture paths | ✅ Reused the existing controls config and Three mouse constants |
| 4.4 | `src/scenes/mapNavigation.test.ts` | Unit/structural | ✅ 6/6 focused baseline | ✅ Added help-content and reset-contract tests; focused run failed with missing exports | ✅ `npx vitest run src/scenes/mapNavigation.test.ts`: 1 file, 8 tests passed | ✅ Help contract covers five instruction paths; reset contract invokes the supplied controls instance | ✅ Help content is centralized and reset delegates to built-in OrbitControls behavior |
| 4.2 | `src/scenes/mapNavigation.test.ts` | Unit/build | ✅ 8/8 focused baseline | ✅ Added undefined-event and valid-target contracts before the safety helper | ✅ Focused run: 1 file, 10 tests passed; full `npm test`: 4 files, 17 tests passed; lint and build passed | ✅ Undefined event and bounded target paths both pass | ✅ Extracted the guarded change handler to remove the unsafe inline event access |

## Work Unit Evidence

| Evidence | Result |
|----------|--------|
| Focused test command and exact result | `npx vitest run src/scenes/mapNavigation.test.ts` — GREEN; 1 test file and 10 tests passed |
| Full automated verification and exact result | `npm test` — 4 test files, 17 tests passed; `npm run lint` — passed; `npm run build` — passed, including TypeScript checking and static page generation |
| Runtime harness command/scenario and exact result | N/A — no configured browser/R3F harness exists; manual desktop/mobile verification remains pending and is not claimed |
| Rollback boundary | Revert the guarded OrbitControls change handler in `src/scenes/mapNavigation.ts` and its call site in `src/scenes/SpaceMapScene.tsx`, the two focused tests, and the 4.2 task/progress entries; preserve unrelated navigation, help/reset UI, follow-rig deletion, `Spaceship.tsx`, and texture changes |

## Notes

- This slice preserves all prior completed task evidence and adds the user-requested help/reset extension.
- The help section explicitly describes left-button rotation, right-button movement/panning, middle-button dolly, wheel zoom, and keyboard ship movement.
- The reset button delegates to the existing `OrbitControls` instance's built-in `reset()` behavior; no second camera authority was introduced.
- The help overlay does not capture map gestures; only its reset button opts into pointer events.
- This extension was explicitly requested after the original proposal/spec and was not fully specified there.
- Earlier progress left task 4.2 pending because full suite, build, and manual desktop/mobile verification had not been performed; this slice completed the automated portion. Task 4.3 remains pending for the later verification/refactor phase.
- The current apply slice fixes the optional OrbitControls `onChange` event typing/runtime safety by delegating through `clampMapControlsChange`; automated test, lint, and build verification passed. Manual browser verification remains pending. Task 4.3 remains pending for the later verification/refactor phase.
