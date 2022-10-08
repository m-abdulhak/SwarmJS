import * as React from 'react';
import propTypes from 'prop-types';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

export default function TabContainer({ tabContents }) {
  const [value, setValue] = React.useState('1');

  const onTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = tabContents.map((tabContent, index) => (
    <Tab key={tabContent.label} label={tabContent.label} value={`${index + 1}`} />
  ));

  const tabPanels = tabContents.map((tabContent, index) => (
    <TabPanel key={tabContent.label} value={`${index + 1}`}>{tabContent.content}</TabPanel>
  ));

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={onTabChange} aria-label="lab API tabs example">
            {tabs}
          </TabList>
        </Box>
        {tabPanels}
      </TabContext>
    </Box>
  );
}

TabContainer.propTypes = {
  tabContents: propTypes.arrayOf(
    propTypes.shape({
      label: propTypes.string.isRequired,
      content: propTypes.node.isRequired
    })
  ).isRequired
};
