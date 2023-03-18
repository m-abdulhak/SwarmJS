/* eslint-disable no-console */
/* eslint-disable no-eval */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import IconButton from '@mui/material/IconButton';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

function CodeEditorSection({
  title,
  defaultCode,
  onCodeValid,
  checkIfCodeIsValid,
  setError,
  setCodeIsValid
}) {
  const [code, setCode] = useState(null);

  if (!code && defaultCode) {
    setCode(defaultCode);
  }

  const resetCode = () => {
    setCode(defaultCode);
  };

  useEffect(() => {
    let valid = false;
    let codeError = null;

    try {
      const evaluatedCode = eval(code);

      if (typeof evaluatedCode !== 'function') {
        throw new Error(`Compiled code is not a function, type: ${typeof evaluatedCode}`);
      }

      if (checkIfCodeIsValid && typeof checkIfCodeIsValid === 'function') {
        const res = checkIfCodeIsValid(code);

        if (!res?.valid || res.error) {
          throw new Error(res?.error ?? 'Error validating code.');
        }
      }

      valid = true;
      codeError = null;
    } catch (e) {
      valid = false;
      codeError = e;
    }

    if (valid) {
      onCodeValid(code);
    }

    setCodeIsValid(valid);
    setError(codeError?.message);
  }, [code]);

  return (
    <Grid container item xs={12} md={12} lg={12} spacing={1}>
      <Grid item xs={6} md={10} lg={10}>
        <div className="code-section-header">
          <Typography variant="subtitle1" gutterBottom className="code-section-header-title">
            {title ?? 'Code Editor'}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={6} md={2} lg={2}>
        <div className='code-editor-btn-container'>
          <Tooltip title="Reset Code">
            <IconButton
              color="secondary"
              onClick={() => resetCode()}
              >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Grid>
      <Grid item xs={12} md={12}>
        <AceEditor
          className='code-editor'
          name="robot-controller-code-editor"
          placeholder="Robot Controller Code"
          value={code ?? defaultCode}
          onChange={(newCode) => setCode(newCode)}
          fontSize={16}
          mode='javascript'
          theme='monokai'
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2
          }}
        />
      </Grid>
    </Grid>
  );
}

CodeEditorSection.propTypes = {
  title: PropTypes.string,
  defaultCode: PropTypes.string,
  onCodeValid: PropTypes.func,
  checkIfCodeIsValid: PropTypes.func,
  setCodeIsValid: PropTypes.func,
  setError: PropTypes.func
};

export default CodeEditorSection;
