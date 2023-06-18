export function downLoadTextAsFile(string, filename, type = 'text/plain') {
  const blob = new Blob([string], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

export function getSceneFromUrlQuery(availableConfigs) {
  const query = new URLSearchParams(window.location.search);
  const sceneParam = query.get('scene');

  if (sceneParam != null) {
    const sceneConfig = availableConfigs.find((v) => v.value.toLowerCase() === sceneParam.toLowerCase());

    if (sceneConfig) {
      return sceneConfig.value;
    }
  }

  return availableConfigs[0].value;
}
