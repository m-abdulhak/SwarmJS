/* eslint-disable no-console */
/* eslint-disable no-eval */
import React from 'react';
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
  code,
  setCode,
  defaultCode
}) {
  const resetCode = () => {
    setCode(defaultCode);
  };

  return (
    <Grid container item xs={12} md={12} lg={12} spacing={1}>
      <Grid item xs={10} md={11} lg={11}>
        <div className="code-section-header">
          <Typography variant="subtitle1" gutterBottom className="code-section-header-title">
            {title ?? 'Code Editor'}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={2} md={1} lg={1}>
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
  code: PropTypes.string,
  setCode: PropTypes.func,
  defaultCode: PropTypes.string
};

export default CodeEditorSection;
