const downLoadTextAsFile = (string, filename, type = 'text/plain') => {
  const blob = new Blob([string], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};

export default downLoadTextAsFile;
