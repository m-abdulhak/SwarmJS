/* eslint-disable no-loop-func */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const arrTo2dArr = (arr, width) => {
  const NotImplemented = true;
  return NotImplemented;
};

const mapSceneToArr = (width, height, obstacles) => {
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

      if (!isNotObstacle) {
        const test = "test";
      }

      if (iValid && jValid && notSameElement && isNotObstacle) {
        neighbors.push({ x: i, y: j });
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
  ),
});

const getElemKey = (el) => `${el.x}-${el.y}`;

const getDistanceTransformTo = (mapArr, width, height, goalPosition) => {
  const map = arrTo2dArrWrapper(mapArr, width);
  const dtMap = new Array(height).fill(null).map(() => Array(width).fill(NaN));
  const neighbors = getNeighborsGenerator(mapArr, width, height);

  const elementsMemory = [];
  let currentElements = [
    {
      x: Math.floor(goalPosition.x / 4),
      y: Math.floor(goalPosition.y / 4),
    },
  ];

  let curDistance = 0;

  while (currentElements.length > 0) {
    const newElements = [];

    for (let index = 0; index < currentElements.length; index += 1) {
      const el = currentElements[index];
      const key = getElemKey(el);

      if (elementsMemory.indexOf(key) < 0) {
        dtMap[el.y][el.x] = map.get(el.x, el.y) === 1 ? NaN : curDistance;

        elementsMemory.push(key);

        const ns = neighbors(el.x, el.y);

        newElements.push(
          ...ns.filter(
            (n) => elementsMemory.indexOf(getElemKey(n)) < 0,
          ),
        );
      }
    }

    // currentElements.forEach((el) => {
    //   const key = getElemKey(el);

    //   if (elementsMemory.indexOf(key) >= 0) {
    //     return;
    //   }

    //   dtMap[el.y][el.x] = map.get(el.x, el.y) === 1 ? NaN : curDistance;

    //   elementsMemory.push(key);

    //   const ns = neighbors(el.x, el.y);

    //   newElements.push(
    //     ...ns.filter(
    //       (n) => elementsMemory.indexOf(getElemKey(n)) < 0,
    //     ),
    //   );
    // });

    currentElements = newElements;
    curDistance += 1;
  }

  return dtMap;
};

const drawMap = (canvas, arr, is2D) => {
  const scale = 4;
  const w = 800 / scale;
  const h = 500 / scale;
  const c2 = canvas;
  const ctx2 = c2.getContext('2d');

  const c1 = document.createElement('canvas');
  c1.width = w;
  c1.height = h;
  const ctx1 = c1.getContext('2d');

  const imgData = ctx1.createImageData(w, h);

  for (let i = 0; i < imgData.data.length; i += 4) {
    const x = (i / 4) % c1.width;
    const y = Math.floor(i / (4 * c1.width));
    if (is2D) {
      // const arrY = Math.floor(y / scale);
      // const arrX = Math.floor(x / scale);
      const arrY = y;
      const arrX = x;
      imgData.data[i] = arr[arrY][arrX];
      imgData.data[i + 1] = arr[arrY][arrX];
      imgData.data[i + 2] = arr[arrY][arrX];
    } else {
      // const arrI = Math.floor(i / (scale * scale));
      const arrI = i;
      imgData.data[i] = arr[arrI / 4] * 255;
      imgData.data[i + 1] = arr[arrI / 4] * 255;
      imgData.data[i + 2] = arr[arrI / 4] * 255;
    }
    imgData.data[i + 3] = 255;
  }
  ctx1.putImageData(imgData, 0, 0);

  c2.width = w;
  c2.height = h;

  ctx2.drawImage(c1, 0, 0, w, h);
};
