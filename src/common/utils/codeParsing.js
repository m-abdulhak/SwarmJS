export const changeFuncCodeToArrow = (funcCode) => {
  if (!funcCode || typeof funcCode !== 'string') {
    throw new Error('Invalid controller code.');
  }

  let arrowCode = funcCode.trim();
  if (arrowCode.startsWith('function')) {
    // Remove 'function'
    arrowCode = arrowCode.replace('function', '');

    // Remove function name in case function is named
    const indexOfFirstBraces = arrowCode.indexOf('(');
    arrowCode = arrowCode.slice(indexOfFirstBraces);

    // Add arrow function syntax
    arrowCode = arrowCode.replace('{', '=> {');
  }

  return arrowCode.trim();
};

export const parseFunctionToEditorCode = (func) => {
  const funcCode = func && typeof func === 'function' ? func.toString() : '';
  return changeFuncCodeToArrow(funcCode);
};
