# Mouse Map Navigation Specification

## Purpose

Players can inspect and navigate the solar-system map with the mouse independently of spaceship movement.

## Requirements

### Requirement: Independent map panning

The map camera MUST pan in response to a mouse drag over the map, without changing the spaceship's position, heading, or movement state. Panning MUST remain within scene-appropriate map bounds.

#### Scenario: Player pans the map

- GIVEN the map is visible and the pointer is over its navigable area
- WHEN the player presses the primary mouse button and drags
- THEN the map view follows the drag direction
- AND the spaceship remains unaffected

#### Scenario: Player reaches a pan boundary

- GIVEN the camera is at a configured map boundary
- WHEN the player drags farther beyond that boundary
- THEN the camera remains within the boundary
- AND no error or visible scene break occurs

### Requirement: Bounded mouse zoom

The map camera MUST zoom in response to the mouse wheel and MUST enforce usable minimum and maximum zoom limits.

#### Scenario: Player zooms the map

- GIVEN the map is visible
- WHEN the player scrolls the mouse wheel over the map
- THEN the map view zooms in the requested direction
- AND the spaceship does not move

#### Scenario: Player exceeds a zoom limit

- GIVEN the camera is at its minimum or maximum zoom
- WHEN the player continues scrolling in the limited direction
- THEN the camera remains at that limit
- AND the map remains usable

### Requirement: Independent camera authority

The map camera MUST preserve a player's pan or zoom state while the spaceship moves. Keyboard movement MUST continue to control the spaceship, and proximity detection MUST remain unchanged.

#### Scenario: Ship moves after camera navigation

- GIVEN the player has panned or zoomed the map
- WHEN the player uses the keyboard to move the spaceship
- THEN the spaceship moves according to existing controls
- AND the camera does not automatically recenter on or follow the spaceship

### Requirement: Reliable click and drag interaction

Planet selection MUST occur for an intentional click and MUST NOT occur solely because a pointer drag crossed a planet.

#### Scenario: Player selects a planet

- GIVEN the pointer is over a planet and has not performed a drag
- WHEN the player presses and releases the primary mouse button
- THEN that planet is selected and its existing details interaction opens

#### Scenario: Player drags across a planet

- GIVEN the player begins a map drag over or near a planet
- WHEN the pointer moves before the button is released
- THEN the map pans as applicable
- AND the planet is not selected solely by that drag

### Requirement: Navigation discoverability and viewport usability

The map hint or legend MUST communicate mouse pan and wheel zoom gestures. Mouse navigation SHOULD remain usable at supported desktop and mobile viewport sizes; when a viewport cannot provide mouse input, existing keyboard navigation MUST remain available.

#### Scenario: Player reads the map hint

- GIVEN the map scene is displayed
- WHEN the player views its hint or legend
- THEN the mouse drag and wheel zoom gestures are described

#### Scenario: Pointer input is unavailable

- GIVEN the map is displayed in an environment without mouse input
- WHEN the player uses the existing keyboard controls
- THEN spaceship movement continues without requiring mouse navigation
