import React from 'react';
import { Tabs } from 'antd';
import MeterInformation from './MeterInformation';
import DataOnDemand from './DataOnDemand';
import MeterReading from './MeterReading';
import Configurations from './Configurations';
import FirmwareUpgrade from './FirmwareUpgrade';
import SecuritySetup from './SecuritySetup';
import Alarms from './Alarms';
import TransactionLog from './TransactionLog';
import DynamicConfigurations from './DynamicConfigurations';
import DynamicOnDemand from './DynamicOnDemand';
import PowerConnectDisconnect from './PowerConnectDisconnect';

const DetailPage = ({ data,office }) => {
  const tabItems = [
    {
      label: 'Meter Information',
      key: 'meterinfo',
      children: <MeterInformation meternum={data.meterno} meterInter={data.meterInterface}/>,
    },
    {
      label: 'Data On Demand',
      key: 'dataondemand',
      children: <DataOnDemand meternum={data.meterno} />,
    },
    {
      label: 'Meter Reading',
      key: 'meterreading',
      children: <MeterReading meternum={data.meterno} meterman={data.metermake} meterty={data.metertype}/>,
    },
    {
      label: 'Configurations',
      key: 'configurations',
      children: <Configurations meternum={data.meterno} />,
    },
    {
      label: 'Firmware Upgrade',
      key: 'firmwareupgrade',
      children: <FirmwareUpgrade meternum={data.meterno} />,
    },
    {
      label: 'Security Setup',
      key: 'securitysetup',
      children: <SecuritySetup meternum={data.meterno} />,
    },
    {
      label: 'Alarms',
      key: 'alarms',
      children: <Alarms meternum={data.meterno} officeid={office}/>,
    },
    {
      label: 'Transaction Log',
      key: 'transactionlog',
      children: <TransactionLog meternum={data.meterno} officeid={office}/>,
    },
    {
      label: 'Dynamic Configurations',
      key: 'dynamicconfigurations',
      children: <DynamicConfigurations meternum={data.meterno} meterty={data.metertype} meterman={data.metermake} />,
    },
    {
      label: 'Dynamic OnDemand',
      key: 'dynamicondemand',
      children: <DynamicOnDemand meternum={data.meterno} meterty={data.metertype} meterman={data.metermake}/>,
    },
    {
      label: 'Power Connect Disconnect',
      key: 'powerconndisconn',
      children: <PowerConnectDisconnect meternum={data.meterno} />,
    },
  ];

  return (
    <div className="container-fluid mt-3" style={{marginBottom:'20px'}}>
      <Tabs defaultActiveKey="meterinfo" items={tabItems} />
    </div>
  );
};

export default DetailPage;
