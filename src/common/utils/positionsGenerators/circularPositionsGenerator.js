export default function getCircularPositionsGenerator(posNum, radius, envWidth, envHeight) {
  const circleRadius = (Math.min(envWidth, envHeight) * 20) / 42;
  const resolution = (Math.PI * 2) / posNum;
  const envCenter = { x: envWidth / 2, y: envHeight / 2 };

  if (circleRadius * resolution < radius * 4) {
    throw new Error('Invalid inputs, number and size of robots are too high for this environment size!');
  }

  const positions = [];
  const start = Math.random() * Math.PI * 2;
  let i = start;
  while (i < start + Math.PI * 2) {
    const newX = envCenter.x + circleRadius * Math.cos(i);
    const newY = envCenter.y + circleRadius * Math.sin(i);
    const newGoalX = envCenter.x - circleRadius * Math.cos(i);
    const newGoalY = envCenter.y - circleRadius * Math.sin(i);
    const newPos = { x: newX, y: newY };
    const newGoalPos = { x: newGoalX, y: newGoalY };

    positions.push(newPos);
    positions.push(newGoalPos);

    i += resolution + (Math.random() * resolution) / 100 - resolution / 50;
  }

  if (positions.length < posNum * 2) {
    throw new Error('Invalid inputs, number and size of robots are too high for this environment size!');
  }

  const getPos = () => {
    if (positions.length === 0) {
      throw new Error('No positions available!');
    }
    return positions.pop();
  };

  return getPos;
}