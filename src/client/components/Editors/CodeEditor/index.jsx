/* eslint-disable no-console */
/* eslint-disable no-eval */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

function CodeEditor({
  deploy,
  defaultCode,
  onCodeValid,
  checkIfCodeIsValid
}) {
  const [code, setCode] = useState(null);
  const [error, setError] = useState(null);
  const [codeIsValid, setCodeIsValid] = useState(true);

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

  const alertElem = (
    <Alert className="code-editor-alert" severity={ codeIsValid ? 'success' : 'error'}>
      { codeIsValid ? 'Code compiled successfully.' : 'Error compiling code'}
    </Alert>
  );

  const errorElem = (
    <Alert icon={false} severity={ error ? 'error' : 'success'}>
      {error ?? 'No errors found.'}
    </Alert>
  );

  const codeAlertElem = (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        {alertElem}
      </AccordionSummary>
      <AccordionDetails>
        {errorElem}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={2} lg={1}>
        <div className='code-editor-btn-container'>
          <Tooltip title="Reset Code">
            <IconButton
              color="secondary"
              onClick={() => resetCode()}
              >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deploy Code">
            <IconButton
              color="primary"
              onClick={() => deploy()}
              >
              <PlayCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Grid>
      <Grid item xs={12} md={10} lg={11}>
          {codeAlertElem}
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

CodeEditor.propTypes = {
  defaultCode: PropTypes.string,
  onCodeValid: PropTypes.func,
  deploy: PropTypes.func,
  checkIfCodeIsValid: PropTypes.func
};

export default CodeEditor;
