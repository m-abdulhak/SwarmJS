import * as StackBlur from 'stackblur-canvas/dist/stackblur-es.min';

export default function fieldDiffusion(scene) {
  for (const field of Object.values(scene.fields || {})) {
    // Apply simple Gaussian-like blur filter with the passed radius to a specified box in the field
    // parameters: (canvasElement, xOfTopLeftBox, yOfTopLeftBox, widthOfBox, heightOfBox, radiusOfBlur)
    // Reference for the blur algorithm availabe at: https://www.npmjs.com/package/stackblur-canvas
    if (field?.canvasElem?.width && field?.canvasElem?.height) {
      StackBlur.canvasRGBA(field.canvasElem, 0, 0, field.canvasElem.width, field.canvasElem.height, 15);
    }
  }
}
