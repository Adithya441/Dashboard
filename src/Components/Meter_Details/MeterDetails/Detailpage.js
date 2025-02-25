import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import MeterInformatioreload from "./MeterInformatioreload";
import DataOnDemandreload from "./DataOnDemandreload";
import MeterReadingreload from "./MeterReadingreload";
import Configurationsreload from "./Configurationsreload";
import FirmwareUpgradereload from "./FirmwareUpgradereload";
import SecuritySetupreload from "./SecuritySetupreload";
import Alarmsreload from "./Alarmsreload";
import TransactionLogreload from "./TransactionLogreload";
import DynamicConfigurationsreload from "./DynamicConfigurationsreload";
import DynamicOnDemandreload from "./DynamicOnDemandreload";
import PowerConnectDisconnectreload from "./PowerConnectDisconnectreload";

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
        <MeterInformatioreload
          meternum={data.meterno}
          meterInter={data.meterInterface}
        />
      ),
    },
    {
      label: "Data On Demand",
      content: <DataOnDemandreload meternum={data.meterno} meterman={data.metermake} meterty={data.metertype} />,
    },
    {
      label: "Meter Reading",
      content: (
        <MeterReadingreload
          meternum={data.meterno}
          meterman={data.metermake}
          meterty={data.metertype}
        />
      ),
    },
    {
      label: "Configurations",
      content: <Configurationsreload meternum={data.meterno} />,
    },
    {
      label: "Firmware Upgrade",
      content: <FirmwareUpgradereload meternum={data.meterno} />,
    },
    {
      label: "Security Setup",
      content: <SecuritySetupreload meternum={data.meterno} />,
    },
    {
      label: "Alarms",
      content: <Alarmsreload meternum={data.meterno} officeid={office} />,
    },
    {
      label: "Transaction Log",
      content: <TransactionLogreload meternum={data.meterno} officeid={office} />,
    },
    {
      label: "Dynamic Configurations",
      content: (
        <DynamicConfigurationsreload
          meternum={data.meterno}
          meterty={data.metertype}
          meterman={data.metermake}
        />
      ),
    },
    {
      label: "Dynamic OnDemand",
      content: (
        <DynamicOnDemandreload
          meternum={data.meterno}
          meterty={data.metertype}
          meterman={data.metermake}
        />
      ),
    },
    {
      label: "Power Connect Disconnect",
      content: <PowerConnectDisconnectreload meternum={data.meterno} />,
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
