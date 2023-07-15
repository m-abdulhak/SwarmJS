/* eslint-disable no-console */
/* eslint-disable no-eval */
import React, { useRef, useEffect } from 'react';
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
  defaultCode,
  getDefaultCode,
  foldAll,
  readOnly
}) {
  const editorRef = useRef(null);

  const resetCode = () => {
    if (getDefaultCode && typeof getDefaultCode === 'function') {
      setCode(getDefaultCode());
    } else {
      setCode(defaultCode);
    }
  };

  useEffect(() => {
    if (foldAll) {
      editorRef.current.editor.session.foldAll(1, editorRef.current.editor.session.doc.getAllLines().length);
    }
  }, [code]);

  return (
    <Grid container item xs={12} md={12} lg={12} spacing={1}>
      <Grid item xs={10} md={11} lg={11}>
        <div className="input-section-header">
          <Typography variant="subtitle1" gutterBottom className="input-section-header-title">
            {title ?? 'Code Editor'}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={2} md={1} lg={1}>
        <div className='code-editor-btn-container'>
          <Tooltip title="Reset">
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
          ref={editorRef}
          className='code-editor'
          value={code || defaultCode}
          onChange={(newCode) => setCode(newCode)}
          fontSize={16}
          mode='javascript'
          theme='monokai'
          highlightActiveLine={true}
          readOnly={readOnly || false}
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
  defaultCode: PropTypes.string,
  getDefaultCode: PropTypes.func,
  foldAll: PropTypes.bool,
  readOnly: PropTypes.bool
};

export default CodeEditorSection;
