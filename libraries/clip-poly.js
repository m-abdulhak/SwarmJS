/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */

'use strict';

var SPLITTER = +(Math.pow(2, 27) + 1.0)

function twoProduct(a, b, result) {
  var x = a * b

  var c = SPLITTER * a
  var abig = c - a
  var ahi = c - abig
  var alo = a - ahi

  var d = SPLITTER * b
  var bbig = d - b
  var bhi = d - bbig
  var blo = b - bhi

  var err1 = x - (ahi * bhi)
  var err2 = err1 - (alo * bhi)
  var err3 = err2 - (ahi * blo)

  var y = alo * blo - err3

  if(result) {
    result[0] = y
    result[1] = x
    return result
  }

  return [ y, x ]
}

//Easy case: Add two scalars
function scalarScalar(a, b) {
  const x = a + b
  const bv = x - a
  const av = x - bv
  const br = b - bv
  const ar = a - av
  const y = ar + br
  if(y) {
    return [y, x]
  }
  return [x]
}

function robustSum(e, f) {
  const ne = e.length | 0;
  const nf = f.length | 0;
  if (ne === 1 && nf === 1) {
    return scalarScalar(e[0], f[0]);
  }
  const n = ne + nf
  const g = new Array(n)
  let count = 0
  let eptr = 0
  let fptr = 0
  const abs = Math.abs
  let ei = e[eptr]
  let ea = abs(ei)
  let fi = f[fptr]
  let fa = abs(fi)
  let a, b
  if(ea < fa) {
    b = ei
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
      ea = abs(ei)
    }
  } else {
    b = fi
    fptr += 1
    if(fptr < nf) {
      fi = f[fptr]
      fa = abs(fi)
    }
  }
  if((eptr < ne && ea < fa) || (fptr >= nf)) {
    a = ei
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
      ea = abs(ei)
    }
  } else {
    a = fi
    fptr += 1
    if(fptr < nf) {
      fi = f[fptr]
      fa = abs(fi)
    }
  }
  let x = a + b
  let bv = x - a
  let y = b - bv
  let q0 = y
  let q1 = x
  let _x, _bv, _av, _br, _ar
  while(eptr < ne && fptr < nf) {
    if(ea < fa) {
      a = ei
      eptr += 1
      if(eptr < ne) {
        ei = e[eptr]
        ea = abs(ei)
      }
    } else {
      a = fi
      fptr += 1
      if(fptr < nf) {
        fi = f[fptr]
        fa = abs(fi)
      }
    }
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    }
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
  }
  while(eptr < ne) {
    a = ei
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    }
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
    eptr += 1
    if(eptr < ne) {
      ei = e[eptr]
    }
  }
  while(fptr < nf) {
    a = fi
    b = q0
    x = a + b
    bv = x - a
    y = b - bv
    if(y) {
      g[count++] = y
    } 
    _x = q1 + x
    _bv = _x - q1
    _av = _x - _bv
    _br = x - _bv
    _ar = q1 - _av
    q0 = _ar + _br
    q1 = _x
    fptr += 1
    if(fptr < nf) {
      fi = f[fptr]
    }
  }
  if(q0) {
    g[count++] = q0;
  }
  if(q1) {
    g[count++] = q1;
  }
  if(!count) {
    g[count++] = 0.0;
  }
  g.length = count;
  return g;
}

function robustDotProduct(a, b) {
  let r = twoProduct(a[0], b[0]);
  for (let i = 1; i < a.length; ++i) {
    r = robustSum(r, twoProduct(a[i], b[i]));
  }
  return r;
}

function planeT(p, plane) {
  const r = robustSum(robustDotProduct(p, plane), [plane[plane.length - 1]]);
  return r[r.length - 1];
}

// Can't do this exactly and emit a floating point result
function lerpW(a, wa, b, wb) {
  const d = wb - wa;
  let t = -wa / d;
  if (t < 0.0) {
    t = 0.0;
  } else if (t > 1.0) {
    t = 1.0;
  }
  const ti = 1.0 - t;
  const n = a.length;
  const r = new Array(n);
  for (let i = 0; i < n; ++i) {
    r[i] = t * a[i] + ti * b[i];
  }
  return r;
}

function splitPolygon(points, plane) {
  const pos = [];
  const neg = [];
  let a = planeT(points[points.length - 1], plane);
  for (let s = points[points.length - 1], t = points[0], i = 0; i < points.length; ++i, s = t) {
    t = points[i];
    const b = planeT(t, plane);
    if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
      const p = lerpW(s, b, t, a);
      pos.push(p);
      neg.push(p.slice());
    }
    if (b < 0) {
      neg.push(t.slice());
    } else if (b > 0) {
      pos.push(t.slice());
    } else {
      pos.push(t.slice());
      neg.push(t.slice());
    }
    a = b;
  }
  return [pos, neg];
}

function positive(points, plane) {
  const pos = [];
  let a = planeT(points[points.length - 1], plane);
  for (let s = points[points.length - 1], t = points[0], i = 0; i < points.length; ++i, s = t) {
    t = points[i];
    const b = planeT(t, plane);
    if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
      pos.push(lerpW(s, b, t, a));
    }
    if (b >= 0) {
      pos.push(t.slice());
    }
    a = b;
  }
  return pos;
}

function negative(points, plane) {
  const neg = [];
  let a = planeT(points[points.length - 1], plane);
  for (let s = points[points.length - 1], t = points[0], i = 0; i < points.length; ++i, s = t) {
    t = points[i];
    const b = planeT(t, plane);
    if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
      neg.push(lerpW(s, b, t, a));
    }
    if (b <= 0) {
      neg.push(t.slice());
    }
    a = b;
  }
  return neg;
}

function getLineEquationParams(p1, p2) {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;

  const a = y1 - y2;
  const b = x2 - x1;
  const c = (x1 - x2) * y1 + (y2 - y1) * x1;

  return [a, b, c];
}

// let paras = getLineEquationParams({ x: 0.5, y: 0 }, { x: 0.5, y: 1 });

// var p = splitPolygon([[0,0], [1, 0], [1, 1], [0,1]], [0, 1, -0.5])
// console.log(p);

// var p = splitPolygon([[0,0], [1, 0], [1, 1], [0,1]], [1, 0, -0.5]);
// console.log(p);
// var p = splitPolygon([[0,0], [1, 0], [1, 1], [0,1]], paras);
// console.log(p);
