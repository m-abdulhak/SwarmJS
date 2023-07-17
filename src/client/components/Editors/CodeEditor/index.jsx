/* eslint-disable no-console */
/* eslint-disable no-eval */
import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import UploadOutlined from '@mui/icons-material/UploadOutlined';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';

import CodeEditorSection from './CodeEditorSection';
import { downLoadTextAsFile } from '../../../utils';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

const dateOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  hour12: false
};

const downloadCode = (codeJSON) => {
  downLoadTextAsFile(
    JSON.stringify(codeJSON, null, 2),
    `controller ${(new Date()).toLocaleTimeString('en-CA', dateOptions)}.json`,
    'application/json'
  );
};

function CodeEditor({
  deploy,
  sections
}) {
  const fileUploadElement = useRef();
  const [codeJSON, setCodeJSON] = useState(
    sections.reduce((acc, secDef) => ({ ...acc, [secDef.title]: secDef.defaultCode }), {})
  );
  const [errors, setErrors] = useState({});
  const [codeValidity, setCodeValidity] = useState(
    sections.reduce((acc, secDef) => ({ ...acc, [secDef.title]: true }), {})
  );

  useEffect(() => {
    const newValidity = {};
    const newErrors = {};

    for (const sec of sections) {
      const code = codeJSON[sec.title];
      let valid = false;
      let codeError = null;

      try {
        const evaluatedCode = eval(code);

        if (typeof evaluatedCode !== 'function') {
          throw new Error(`Compiled code is not a function, type: ${typeof evaluatedCode}`);
        }

        if (sec.checkIfCodeIsValid && typeof sec.checkIfCodeIsValid === 'function') {
          const res = sec.checkIfCodeIsValid(code);

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
        sec.onCodeValid(code);
      }

      newValidity[sec.title] = valid;
      if (codeError?.message) {
        newErrors[sec.title] = codeError.message;
      }
    }

    setCodeValidity(newValidity);
    setErrors(newErrors);
  }, [codeJSON]);

  const uploadCode = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      try {
        const loadedJSON = JSON.parse(reader.result);
        const newCodes = {};

        for (const sec of sections) {
          if (loadedJSON[sec.title] && typeof loadedJSON[sec.title] === 'string') {
            newCodes[sec.title] = loadedJSON[sec.title];
          } else {
            console.log(`Error, could not load code for section '${sec.title}', not valid string.`);
            newCodes[sec.title] = '';
          }
        }

        setCodeJSON(newCodes);
      } catch (e) {
        console.log('Error, could not load code from selected file:', e);
      }
    });
    reader.readAsText(file);
  };

  const allCodeIsValid = Object.values(codeValidity).reduce((acc, v) => acc && v, true);
  const alertElem = (
    <Alert className="code-editor-alert" severity={ allCodeIsValid ? 'success' : 'error'}>
      { allCodeIsValid ? 'Code compiled successfully.' : 'Error compiling code'}
    </Alert>
  );

  const errorMsgs = Object.entries(errors).reduce((acc, [k, v]) => [...acc, `${k}: ${v}`.replace('::', ':')], []);
  const errorElem = (
    <Alert icon={false} severity={ errorMsgs?.length ? 'error' : 'success'}>
      {!errorMsgs?.length
        ? <p className="code-editor-alert-message">No errors found.</p>
        : errorMsgs.map((msg, indx) => <p key={indx} className="code-editor-alert-message">{msg}</p>)
      }
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

  const editorSectionElems = sections.map(({ title, defaultCode }) => (
      <CodeEditorSection
        key={title ?? 'Editor'}
        title={title}
        code={codeJSON[title] ?? defaultCode ?? ''}
        setCode={(newCode) => {
          setCodeJSON((oldJSONCode) => ({ ...oldJSONCode, [title]: newCode }));
        }}
        defaultCode={defaultCode}
      />
  ));

  const editorId = `code-editor${sections.reduce((acc, cur) => `${acc}-${cur.title}`, '')}`;

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={2} lg={1.5}>
        <div className='code-editor-btn-container'>
          <Tooltip title="Deploy Code">
            <IconButton
              color="primary"
              onClick={() => deploy()}
              >
              <PlayCircleOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save Code To File">
            <IconButton
              color="primary"
              onClick={() => downloadCode(codeJSON)}
              >
              <DownloadOutlined />
            </IconButton>
          </Tooltip>
          <input
            accept='application/json'
            type="file"
            ref={fileUploadElement}
            hidden
            onChange={(event) => uploadCode(event)}
            id={`${editorId}-file-upload`}
          />
          <label htmlFor={`${editorId}-file-upload`}>
            <Tooltip title="Load Code From File">
              <IconButton color="primary" onClick={() => {
                fileUploadElement.current.click();
              }}>
                <UploadOutlined />
              </IconButton>
            </Tooltip>
          </label>
        </div>
      </Grid>
      <Grid item xs={12} md={10} lg={10.5}>
          {codeAlertElem}
      </Grid>
      {editorSectionElems}
    </Grid>
  );
}

CodeEditor.propTypes = {
  deploy: PropTypes.func,
  sections: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    defaultCode: PropTypes.string,
    onCodeValid: PropTypes.func,
    checkIfCodeIsValid: PropTypes.func
  })).isRequired
};

export default memo(CodeEditor);
