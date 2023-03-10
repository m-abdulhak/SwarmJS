export const changeFuncCodeToArrow = (funcCode) => {
  if (!funcCode || typeof funcCode !== 'string') {
    throw new Error('Invalid controller code.');
  }

  let arrowCode = funcCode.trim();
  if (arrowCode.startsWith('function')) {
    arrowCode = arrowCode.replace('function', '');
    arrowCode = arrowCode.replace('{', '=> {');
  }

  return arrowCode.trim();
};

export const parseFunctionToEditorCode = (func) => {
  const funcCode = func && typeof func === 'function' ? func.toString() : '';
  return changeFuncCodeToArrow(funcCode);
};
