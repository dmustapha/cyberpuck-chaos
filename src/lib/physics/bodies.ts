import Matter from 'matter-js';
import { PHYSICS_CONFIG } from './config';

const { Bodies } = Matter;

/**
 * Create the puck body
 */
export function createPuck(): Matter.Body {
  const { table, puck } = PHYSICS_CONFIG;

  return Bodies.circle(
    table.width / 2,
    table.height / 2,
    puck.radius,
    {
      label: 'puck',
      mass: puck.mass,
      restitution: puck.restitution,
      friction: puck.friction,
      frictionAir: puck.frictionAir,
      frictionStatic: 0,
      render: {
        fillStyle: '#ffffff',
      },
    }
  );
}

/**
 * Create a paddle body for the specified player
 */
export function createPaddle(player: 'player1' | 'player2'): Matter.Body {
  const { table, paddle } = PHYSICS_CONFIG;

  // Player 1 at bottom, Player 2 at top
  const y = player === 'player1'
    ? table.height * 0.85
    : table.height * 0.15;

  const color = player === 'player1' ? '#3b82f6' : '#ef4444';

  return Bodies.circle(
    table.width / 2,
    y,
    paddle.radius,
    {
      label: player,
      isStatic: true,  // Kinematic - position controlled directly, not by physics
      restitution: paddle.restitution,
      friction: paddle.friction,
      render: {
        fillStyle: color,
      },
    }
  );
}

/**
 * Create all wall bodies (with gaps for goals)
 */
export function createWalls(): Matter.Body[] {
  const { table, wall } = PHYSICS_CONFIG;
  const { width, height, wallThickness, goalWidth } = table;

  const halfGoal = goalWidth / 2;
  const centerX = width / 2;
  const sideWidth = centerX - halfGoal;

  const wallOptions = {
    isStatic: true,
    restitution: wall.restitution,
    friction: wall.friction,
    render: {
      fillStyle: '#374151',
    },
  };

  return [
    // Left wall (full height)
    Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { ...wallOptions, label: 'wall-left' }
    ),

    // Right wall (full height)
    Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { ...wallOptions, label: 'wall-right' }
    ),

    // Top wall - left segment (positioned AT y=0, not above)
    Bodies.rectangle(
      sideWidth / 2,
      0,
      sideWidth,
      wallThickness,
      { ...wallOptions, label: 'wall-top-left' }
    ),

    // Top wall - right segment
    Bodies.rectangle(
      width - sideWidth / 2,
      0,
      sideWidth,
      wallThickness,
      { ...wallOptions, label: 'wall-top-right' }
    ),

    // Bottom wall - left segment (positioned AT y=height)
    Bodies.rectangle(
      sideWidth / 2,
      height,
      sideWidth,
      wallThickness,
      { ...wallOptions, label: 'wall-bottom-left' }
    ),

    // Bottom wall - right segment
    Bodies.rectangle(
      width - sideWidth / 2,
      height,
      sideWidth,
      wallThickness,
      { ...wallOptions, label: 'wall-bottom-right' }
    ),
  ];
}

/**
 * Create goal sensor bodies (detect when puck enters)
 * These are positioned in the goal gap area to detect scoring
 */
export function createGoals(): Matter.Body[] {
  const { table, puck } = PHYSICS_CONFIG;
  const { width, height, goalWidth } = table;

  // Goal sensors are positioned in the goal area
  // They should detect when the puck enters the goal gap
  const goalDepth = 50;

  const goalOptions = {
    isStatic: true,
    isSensor: true, // Sensors don't cause physical collisions, just detect overlap
    render: {
      fillStyle: 'transparent',
    },
  };

  return [
    // Player 1's goal (bottom) - Player 2 scores here
    // Sensor at the bottom edge, in the goal gap
    Bodies.rectangle(
      width / 2,
      height + goalDepth / 2 - 10, // Slightly overlapping with play area
      goalWidth,
      goalDepth,
      { ...goalOptions, label: 'goal1' }
    ),

    // Player 2's goal (top) - Player 1 scores here
    // Sensor at the top edge, in the goal gap
    Bodies.rectangle(
      width / 2,
      -goalDepth / 2 + 10, // Slightly overlapping with play area
      goalWidth,
      goalDepth,
      { ...goalOptions, label: 'goal2' }
    ),
  ];
}
