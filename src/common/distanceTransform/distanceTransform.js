/* eslint-disable camelcase */
export default function distanceFromBooleanImage(booleanImage, width, height, method) {
  // First phase
  const infinity = width + height;
  const b = booleanImage;
  const g = new Array(width * height);
  for (let x = 0; x < width; x += 1) {
    if (b[x + 0 * width]) g[x + 0 * width] = 0;
    else g[x + 0 * width] = infinity;
    // Scan 1
    for (let y = 1; y < height; y += 1) {
      if (b[x + y * width]) g[x + y * width] = 0;
      else g[x + y * width] = 1 + g[x + (y - 1) * width];
    }
    // Scan 2
    for (let y = height - 1; y >= 0; y -= 1) {
      if (g[x + (y + 1) * width] < g[x + y * width]) g[x + y * width] = 1 + g[x + (y + 1) * width];
    }
  }

  // Euclidean
  function EDT_f(x, i, g_i) {
    return (x - i) * (x - i) + g_i * g_i;
  }
  function EDT_Sep(i, u, g_i, g_u) {
    return Math.floor((u * u - i * i + g_u * g_u - g_i * g_i) / (2 * (u - i)));
  }

  // Manhattan
  function MDT_f(x, i, g_i) {
    return Math.abs(x - i) + g_i;
  }

  function MDT_Sep(i, u, g_i, g_u) {
    if (g_u >= (g_i + u - i)) return infinity;
    if (g_i > (g_u + u - i)) return -infinity;
    return Math.floor((g_u - g_i + u + i) / 2);
  }

  // Chessboard
  function CDT_f(x, i, g_i) {
    return Math.max(Math.abs(x - i), g_i);
  }

  function CDT_Sep(i, u, g_i, g_u) {
    if (g_i <= g_u) return Math.max(i + g_u, Math.floor((i + u) / 2));
    return Math.min(u - g_i, Math.floor((i + u) / 2));
  }

  const methodsF = {
    EDT: EDT_f,
    MDT: MDT_f,
    CDT: CDT_f
  };

  const methodsSep = {
    EDT: EDT_Sep,
    MDT: MDT_Sep,
    CDT: CDT_Sep
  };

  // Second phase
  const f = methodsF[method];
  const Sep = methodsSep[method];
  const dt = new Array(width * height);
  const s = new Array(width);
  const t = new Array(width);
  let q = 0;
  let w;
  for (let y = 0; y < height; y += 1) {
    q = 0;
    s[0] = 0;
    t[0] = 0;

    // Scan 3
    for (let u = 1; u < width; u += 1) {
      while (q >= 0 && f(t[q], s[q], g[s[q] + y * width]) > f(t[q], u, g[u + y * width])) q -= 1;
      if (q < 0) {
        q = 0;
        s[0] = u;
      } else {
        w = 1 + Sep(s[q], u, g[s[q] + y * width], g[u + y * width]);
        if (w < width) {
          q += 1;
          s[q] = u;
          t[q] = w;
        }
      }
    }

    // Scan 4
    for (let u = width - 1; u >= 0; u -= 1) {
      let d = f(u, s[q], g[s[q] + y * width]);
      if (method === 'EDT') { d = Math.floor(Math.sqrt(d)); }
      dt[u + y * width] = d;
      if (u === t[q]) q -= 1;
    }
  }

  const newArr = [];
  for (let index = 0; index < dt.length; index += width) {
    newArr.push(dt.slice(index, index + width));
  }

  return newArr;
}
