const getColorIndicesForCoord = (x, y, width) => {
  const redIndx = y * (width * 4) + x * 4;
  return [redIndx, redIndx + 1, redIndx + 2, redIndx + 3];
};

/**
 * Updates the field at a given point on the canvas using the provided kernel.
 * @param {CanvasRenderingContext2D} canvasContext - The canvas context to update.
 * @param {Object} position - The position to update.
 * @param {number} position.x - The x-coordinate of the position to update.
 * @param {number} position.y - The y-coordinate of the position to update.
 * @param {Array.<Array.<number>>|Array.<number>} value - The kernel to update with. Can be a 2D array of RGBA
 * pixel values or a single RGBA pixel value.
 * @returns {ImageData|null} The updated image data or null if the update was not successful.
 * @throws {Error} If the value is invalid or if the update kernel is invalid.
 */
export function updateFieldAtPoint(canvasContext, position, value) {
  const xp = Math.floor(position.x);
  const yp = Math.floor(position.y);

  if (xp < 0 || yp < 0 || xp >= canvasContext.canvas.width || yp >= canvasContext.canvas.height) {
    return null;
  }

  if (
    !value.length
    || !canvasContext
    || typeof canvasContext.getImageData !== 'function'
    || typeof canvasContext.putImageData !== 'function'
  ) {
    return null;
  }

  if (!Array.isArray(value[0])) {
    if (value.length !== 3 && value.length !== 4) {
      throw new Error('Invalid pixel color value received:', value);
    }
    // eslint-disable-next-line no-param-reassign
    value = [[value]];
  }

  const vLen = value.length;
  if (vLen % 2 !== 1 || value.some((row) => row.length !== vLen)) {
    throw new Error('Invalid update kernel received:', value);
  }

  const minXIndx = xp - Math.floor(vLen / 2);
  const minYIndx = yp - Math.floor(vLen / 2);

  const imageVal = canvasContext.getImageData(minXIndx, minYIndx, vLen, vLen);

  for (let x = 0; x < vLen; x += 1) {
    for (let y = 0; y < vLen; y += 1) {
      const [rIndx, gIndx, bIndx, aIndx] = getColorIndicesForCoord(x, y, vLen);
      const [r, g, b, a] = value[y][x];

      imageVal.data[rIndx] = r;
      imageVal.data[gIndx] = g;
      imageVal.data[bIndx] = b;
      imageVal.data[aIndx] = a ?? 255;
    }
  }

  canvasContext.putImageData(imageVal, xp, yp, 0, 0, vLen, vLen);

  return imageVal.data;
}

export function sampleFieldAtPoint(context, p) {
  if (!context?.getImageData || typeof context.getImageData !== 'function') {
    return null;
  }

  if (p.x < 0 || p.y < 0 || p.x >= context.canvas.width || p.y >= context.canvas.width) {
    return [0, 0, 0, 0];
  }

  const imageVal = context.getImageData(p.x, p.y, 1, 1);
  return imageVal.data;
}
