import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import MeterInformation from "./MeterInformation";
import DataOnDemand from "./DataOnDemand";
import MeterReading from "./MeterReading";
import Configurations from "./Configurations";
import FirmwareUpgrade from "./FirmwareUpgrade";
import SecuritySetup from "./SecuritySetup";
import Alarms from "./Alarms";
import TransactionLog from "./TransactionLog";
import DynamicConfigurations from "./DynamicConfigurations";
import DynamicOnDemand from "./DynamicOnDemand";
import PowerConnectDisconnect from "./PowerConnectDisconnect";

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

const DetailPage = ({ data, office }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabItems = [
    {
      label: "Meter Information",
      content: (
        <MeterInformation
          meternum={data.meterno}
          meterInter={data.meterInterface}
        />
      ),
    },
    {
      label: "Data On Demand",
      content: <DataOnDemand meternum={data.meterno} />,
    },
    {
      label: "Meter Reading",
      content: (
        <MeterReading
          meternum={data.meterno}
          meterman={data.metermake}
          meterty={data.metertype}
        />
      ),
    },
    {
      label: "Configurations",
      content: <Configurations meternum={data.meterno} />,
    },
    {
      label: "Firmware Upgrade",
      content: <FirmwareUpgrade meternum={data.meterno} />,
    },
    {
      label: "Security Setup",
      content: <SecuritySetup meternum={data.meterno} />,
    },
    {
      label: "Alarms",
      content: <Alarms meternum={data.meterno} officeid={office} />,
    },
    {
      label: "Transaction Log",
      content: <TransactionLog meternum={data.meterno} officeid={office} />,
    },
    {
      label: "Dynamic Configurations",
      content: (
        <DynamicConfigurations
          meternum={data.meterno}
          meterty={data.metertype}
          meterman={data.metermake}
        />
      ),
    },
    {
      label: "Dynamic OnDemand",
      content: (
        <DynamicOnDemand
          meternum={data.meterno}
          meterty={data.metertype}
          meterman={data.metermake}
        />
      ),
    },
    {
      label: "Power Connect Disconnect",
      content: <PowerConnectDisconnect meternum={data.meterno} />,
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

export default DetailPage;
