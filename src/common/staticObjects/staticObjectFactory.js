import StaticCircle from './staticCircle';
import StaticRectangle from './staticRectangle';

export default function generateStaticObject(definition, scene, shouldAddToWorld = true) {
  const modifiedDef = {
    ...definition,
    skipOrbit: definition.skipOrbit === true
  };

  if (definition.type === 'circle') {
    return new StaticCircle(modifiedDef, scene, shouldAddToWorld);
  }
  if (definition.type === 'rectangle') {
    return new StaticRectangle(modifiedDef, scene, shouldAddToWorld);
  }
  return null;
}
