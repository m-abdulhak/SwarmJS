/* eslint-disable no-console */
/* eslint-disable no-eval */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';

import CodeEditorSection from './CodeEditorSection';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

function CodeEditor({
  deploy,
  sections
}) {
  const [errors, setErrors] = useState({});
  const [codeValidity, setCodeValidity] = useState(
    sections.reduce((acc, secDef) => ({ ...acc, [secDef.title]: true }), {})
  );

  const errorChanged = (sectionTitle, newError) => {
    const newErrors = { ...errors };

    if (newError) {
      newErrors[sectionTitle] = newError;
    } else {
      delete newErrors[sectionTitle];
    }
    setErrors(newErrors);
  };

  const allCodeIsVlaid = Object.values(codeValidity).reduce((acc, v) => acc && v, true);
  const alertElem = (
    <Alert className="code-editor-alert" severity={ allCodeIsVlaid ? 'success' : 'error'}>
      { allCodeIsVlaid ? 'Code compiled successfully.' : 'Error compiling code'}
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

  const editorSections = sections.map(({ title, defaultCode, onCodeValid, checkIfCodeIsValid }) => (
    <CodeEditorSection
      key={title}
      title={title}
      defaultCode={defaultCode}
      onCodeValid={onCodeValid}
      checkIfCodeIsValid={checkIfCodeIsValid}
      setCodeIsValid={(newValidity) => setCodeValidity(
        { ...codeValidity, [title]: newValidity }
      )}
      setError={(newError) => errorChanged(title, newError)}
    />
  ));

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={2} lg={1}>
        <div className='code-editor-btn-container'>
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
      {editorSections}
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

export default CodeEditor;
