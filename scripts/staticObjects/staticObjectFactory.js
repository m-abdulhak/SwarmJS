/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
function generateStaticObject(definition, scene, shouldAddToWorld = true) {
  if (definition.type === 'circle') {
    return new StaticCircle(definition, scene, shouldAddToWorld);
  }
  return null;
}
