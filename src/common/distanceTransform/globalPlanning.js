export const mapSceneToArr = (width, height, obstacles) => {
  const scale = 4;
  const mapHeight = height / scale;
  const mapWidth = width / scale;
  const mapArray = new Array(mapWidth * mapHeight).fill(0);

  // Map scene to an array (0 = Empty, 1 = Obstacle)
  for (let indexH = 0; indexH < mapHeight; indexH += 1) {
    const rowStart = indexH * mapWidth;
    for (let indexW = 0; indexW < mapWidth; indexW += 1) {
      const mapArrIndex = rowStart + indexW;
      let isObstacle = false;

      obstacles.forEach((obj) => {
        if (isObstacle) return;

        if (
          obj.containsPoint({ x: indexW * scale, y: indexH * scale })
        ) {
          isObstacle = true;
        }
      });

      mapArray[mapArrIndex] = isObstacle ? 1 : 0;
    }
  }

  return mapArray;
};

const getNeighborsGenerator = (map, width, height) => (x, y) => {
  const neighbors = [];

  for (let i = x - 1; i <= x + 1; i += 1) {
    for (let j = y - 1; j <= y + 1; j += 1) {
      const iValid = i >= 0 && i < width;
      const jValid = j >= 0 && j < height;
      const notSameElement = i !== x || j !== y;
      const isNotObstacle = map[i + j * width] !== 1;

      if (iValid && jValid && notSameElement && isNotObstacle) {
        neighbors.push([i, j]);
      }
    }
  }

  return neighbors;
};

const arrTo2dArrWrapper = (mapArr, width) => ({
  width,
  height: mapArr.length / width,
  get: (x, y) => (
    x < 0 || y < 0 || x >= width || y >= mapArr.length / width ? undefined : mapArr[x + y * width]
  )
});

const getElemKey = (el) => `${el[0]}-${el[1]}`;

export const getPucksGoalMap = (mapArr, width, height, goalPosition) => {
  const map = arrTo2dArrWrapper(mapArr, width);
  const dtMap = new Array(height).fill(null).map(() => Array(width).fill(NaN));
  const goalMap = new Array(height).fill(null).map(() => Array(width).fill(NaN));
  const neighbors = getNeighborsGenerator(mapArr, width, height);

  const elementsMemory = [];
  let currentElements = [
    [
      Math.floor(goalPosition.x),
      Math.floor(goalPosition.y)
    ]
  ];

  let curDistance = 0;

  while (currentElements.length > 0) {
    const newElements = [];

    for (let index = 0; index < currentElements.length; index += 1) {
      const el = currentElements[index];
      const key = getElemKey(el);

      if (elementsMemory.indexOf(key) < 0) {
        dtMap[el[1]][el[0]] = map.get(el[0], el[1]) === 1 ? NaN : curDistance;

        elementsMemory.push(key);

        const ns = neighbors(el[0], el[1]);

        newElements.push(
          ...ns.filter(
            (n) => elementsMemory.indexOf(getElemKey(n)) < 0
          )
        );
      }
    }

    currentElements = newElements;
    curDistance += 1;
  }

  for (let y = 0; y < dtMap.length; y += 1) {
    for (let x = 0; x < dtMap[0].length; x += 1) {
      const element = dtMap[y][x];

      if (!element || Number.isNaN(element)) {
        goalMap[y][x] = [x, y];
      } else {
        const ns = neighbors(x, y);

        let closestDistance = null;
        let closestNeighbors = [];

        for (let index = 0; index < ns.length; index += 1) {
          const n = ns[index];
          const dist = dtMap[n[1]][n[0]];

          if (closestDistance === null || dist === closestDistance) {
            closestDistance = dist;
            closestNeighbors.push(n);
          } else if (dist < closestDistance) {
            closestDistance = dist;
            closestNeighbors = [n];
          }
        }

        const av = (list) => list.reduce((acc, r) => acc + r, 0) / list.length;

        goalMap[y][x] = [
          av(closestNeighbors.map((n) => n[0])) - x,
          av(closestNeighbors.map((n) => n[1])) - y
        ];
      }
    }
  }

  // return dtMap;
  return goalMap;
};

// const drawMap = (canvas, arr, scale, is2D) => {
//   const w = 800 * scale;
//   const h = 500 * scale;
//   const c2 = canvas;
//   const ctx2 = c2.getContext('2d');

//   const c1 = document.createElement('canvas');
//   c1.width = w;
//   c1.height = h;
//   const ctx1 = c1.getContext('2d');

//   const imgData = ctx1.createImageData(w, h);

//   for (let i = 0; i < imgData.data.length; i += 4) {
//     const x = (i / 4) % c1.width;
//     const y = Math.floor(i / (4 * c1.width));
//     if (is2D) {
//       // const arrY = Math.floor(y / scale);
//       // const arrX = Math.floor(x / scale);
//       const arrY = y;
//       const arrX = x;
//       imgData.data[i] = arr[arrY][arrX];
//       imgData.data[i + 1] = arr[arrY][arrX];
//       imgData.data[i + 2] = arr[arrY][arrX];
//     } else {
//       // const arrI = Math.floor(i / (scale * scale));
//       const arrI = i;
//       imgData.data[i] = arr[arrI / 4] * 255;
//       imgData.data[i + 1] = arr[arrI / 4] * 255;
//       imgData.data[i + 2] = arr[arrI / 4] * 255;
//     }
//     imgData.data[i + 3] = 255;
//   }
//   ctx1.putImageData(imgData, 0, 0);

//   c2.width = w;
//   c2.height = h;

//   ctx2.drawImage(c1, 0, 0, w, h);
// };
