/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
function generateStaticObject(definition, scene, shouldAddToWorld = true) {
  const modifiedDef = {
    ...definition,
    skipOrbit: definition.skipOrbit === true,
  };

  if (definition.type === 'circle') {
    return new StaticCircle(modifiedDef, scene, shouldAddToWorld);
  }
  if (definition.type === 'rectangle') {
    return new StaticRectangle(modifiedDef, scene, shouldAddToWorld);
  }
  return null;
}
