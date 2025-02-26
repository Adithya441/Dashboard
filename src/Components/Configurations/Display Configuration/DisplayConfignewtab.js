import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import DisplayparameterConfiguration from "./DisplayparameterConfiguration";
import DisplayparameterUpdate from "./DisplayparameterUpdate";

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ padding: "16px" }}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const DisplayConfignewtab = ({ data }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabItems = [
    {
      label: "Display Parameters Configuration",
      content: <DisplayparameterConfiguration />,
    },
    {
      label: "Display Parameter Update",
      content: <DisplayparameterUpdate data={data}/>,
    },
  ];

  return (
    <div className="container-fluid mt-3" style={{ marginBottom: "20px" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Meter Details Tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabItems.map((tab, index) => (
            <Tab label={tab.label} key={index} />
          ))}
        </Tabs>
      </Box>
      {tabItems.map((tab, index) => (
        <TabPanel value={value} index={index} key={index}>
          {tab.content}
        </TabPanel>
      ))}
    </div>
  );
};

export default DisplayConfignewtab;
