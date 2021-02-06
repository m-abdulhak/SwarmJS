/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
function generateStaticObject(definition, scene) {
  if (definition.type === 'circle') {
    return new StaticCircle(definition, scene);
  }
  return null;
}
