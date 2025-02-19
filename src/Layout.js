import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Layout, Menu, Tabs, Button, Input, AutoComplete, Typography  } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  HomeOutlined,
  UserOutlined,
  SearchOutlined,
  SettingOutlined,
  MenuOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Dashboard from "./Components/Dashboard/Dashboard_main/Dashboard";
import DataAvailabilitys from "./Components/charts/DataAvailabilitys";
import MeterTabs from "./Components/Meter_Details/MeterDetails/Metertabs";
import Logo from "../src/Assets/images/logo.png";
import Logo1 from "../src/Assets/images/img5.png";
import Reconnectreload from "./Components/Meter_Details/ReconnectScreen/ReconnectReload";
import GroupOnDemandControlreload from "./Components/Meter_Details/GroupOnDemandControl/GroupOnDemandControlReload";
import CommunicationStatistics from "./Components/Dashboard/Communication Statistics/CommunicationStatisticsreload";
import "./Layout.css";
import TransactionLogcontrol from "./Components/Others/TransactionLogcontrol";
import Alarms from "./Components/Others/Alarms/Alarms";
import MeterPing from "./Components/Others/MeterPing/MeterPing";
import EventMapping from "./Components/Configurations/EventMapping";
//import TaskManager from "./Components/Configurations/TaskManager";
//import ProfileHeaderTabs from "./Components/Configurations/ProfileHeaderTabs";
import { GridFill } from "react-bootstrap-icons";
import CommFailureReport from "./Components/Reports/CommFailureReport";
import CMRITransactionReport from "./Components/Reports/CMRITransactionReport";
import SimChangeReport from "./Components/Reports/SimChangeReport";
import AutoMappedMetersReport from "./Components/Reports/AutoMappedMetersReport/AutoMappedMetersReport";
import ConfigurationReport from "./Components/Reports/ConfigurationReport/ConfigurationReport";
import DataAvailabilityReport from "./Components/Reports/DataAvailabilityReport/DataAvailabilityReport";
import DetailedSLAReport from "./Components/Reports/DetailedSLAReport/DetailedSLAReport";
import RTCDriftReport from "./Components/Reports/RTCDriftReport";
import SLAReport from "./Components/Reports/SLAReport";
import Communicationreportreload from "./Components/Reports/CommunicationReportreload";
import NonCommunicationreportreload from "./Components/Reports/NonCommunicationReportreload";
import DeviceMasterreload from "./Components/Reports/DeviceMasterreload";
import TimeSynchronizationreload from "./Components/Reports/TimeSynchronizationreload";
import Exceptionreportreload from "./Components/Reports/ExceptionReportreload";
import Connectdisconnectreportreload from "./Components/Reports/Connectdisconnetreportreload";
import { MaxTabsDialog } from "./Components/Meter_Details/MeterDetails/MeterTabslimit";
 
const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Title } = Typography;
const componentsMap = {
  dashboard: Dashboard,
  DataAvailability: DataAvailabilitys,
  meterdetails: MeterTabs,
  GrouponDemand: GroupOnDemandControlreload,
  Reconnect: Reconnectreload,
  Communicationstatistics: CommunicationStatistics,
  transactionlog: TransactionLogcontrol,
  alarms: Alarms,
  meterping: MeterPing,
  eventmapping: EventMapping,
  // taskmanager: TaskManager,
  // profileheader:ProfileHeaderTabs,
  configurationreport: ConfigurationReport,
  slareport: SLAReport,
  detailedslareport: DetailedSLAReport,
  dataavailabilityreport: DataAvailabilityReport,
  automappedmetersreport: AutoMappedMetersReport,
  rtcdriftreport: RTCDriftReport,
  commfailurereport: CommFailureReport ,
  cmritransreport: CMRITransactionReport,
  simchangereport: SimChangeReport ,
  communicationreport: Communicationreportreload,
  noncommunicationreport: NonCommunicationreportreload,
  devicemaster: DeviceMasterreload,
  timesynchronization: TimeSynchronizationreload,
  exceptionreport: Exceptionreportreload,
  connectdisconnectreport: Connectdisconnectreportreload
  
 
};
 
const menuItems = [
  { key: "dashboard", title: "Dashboard" },
  { key: "Communicationstatistics", title: "Communication Statistics" },
  { key: "DataAvailability", title: "Data Availability 30 days" },
  { key: "meterdetails", title: "Meter Details" },
  { key: "GrouponDemand", title: "Group OnDemand Control" },
  { key: "Reconnect", title: "Reconnect Screen" },
  { key: "transactionlog", title: "Transaction Log" },
  { key: "alarms", title: "Alarms" },
  { key: "meterping", title: "Meter Ping" },
  { key: "eventmapping", title: "Event Mapping" },
  // { key: "taskmanager", title: "Task Manager"},
  // { key:"profileheader",title:"Profile Headers"},
  { key: "configurationreport", title: "Configuration Report"},
  { key: "slareport", title: "SLA Report"},
  { key: "detailedslareport", title: "Detailed SLA Report"},
  { key: "dataavailabilityreport", title: "Data Availability Report"},
  { key: "automappedmetersreport", title: "Auto Mapped Meters Report"},
  { key: "rtcdriftreport", title: "RTC Drift Report"},
  { key: "commfailurereport", title: "Comm Failure Report"},
  { key: "cmritransreport", title: "CMRI Transaction Report"},
  { key: "simchangereport", title: "Sim Change Report"},
  { key: "communicationreport", title: "Communication Report"},
  { key: "noncommunicationreport", title: "Non Communication Report"},
  { key: "devicemaster", title: "Device Master"},
  { key: "timesynchronization", title: "Time Synchronization"},
  { key: "exceptionreport", title: "Exception Report"},
  { key: "connectdisconnectreport", title: "Connect Disconnect Report"}
  
];

const Hello = () => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("dashboard");
  const [tabs, setTabs] = useState([{ key: "dashboard", title: "Dashboard" }]);
  const username = localStorage.getItem("username");
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [filteredItems, setFilteredItems] = useState(menuItems); // State for filtered items
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear(); // Clears local storage
    navigate("/"); // Redirect to home/login page
  };
 
  const handleTabChange = useCallback((newActiveKey) => {
    setActiveKey(newActiveKey);
  }, []);
 
  const handleTabClose = useCallback(
    (targetKey) => {
      setTabs((prevTabs) => {
        if (prevTabs.length === 1) return prevTabs;
        const filteredTabs = prevTabs.filter((tab) => tab.key !== targetKey);
        if (activeKey === targetKey && filteredTabs.length > 0) {
          const newActiveKey = filteredTabs[filteredTabs.length - 1].key;
          setActiveKey(newActiveKey);
        }
        return filteredTabs;
      });
    },
    [activeKey]
  );

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setFilteredItems(
      menuItems.filter((item) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      )
    );
  }, []);
 
  const handleSearchSelect = useCallback(
    (value) => {
      const selectedItem = menuItems.find((item) => item.key === value);
      if (selectedItem) {
        setActiveKey(selectedItem.key);
        setTabs((prev) => {
          if (prev.some((tab) => tab.key === selectedItem.key)) {
            return prev;
          }
          return [...prev, { key: selectedItem.key, title: selectedItem.title }];
        });
      }
    },
    []
  );

  const handleMenuClick = useCallback(({ key }) => {
    setTabs((prev) => {
      if (prev.some((tab) => tab.key === key)) {
        setActiveKey(key);
        return prev;
      }

      if (prev.length >= 7) {
        setIsDialogOpen(true); // Show dialog if limit exceeds
        return prev;
      }

      setActiveKey(key);
      return [...prev, { key, title: key.charAt(0).toUpperCase() + key.slice(1) }];
    });
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={200} // Expanded width
        collapsedWidth={60}
        style={{
          position: "fixed",
          height: "100vh",
          transition: "all 0.3s ease",
          backgroundColor: "#293846",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          className="logo"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "64px",
          }}
        >
          {collapsed ? (
            <img src={Logo1} alt="Collapsed Logo" style={{ width: "40px", height: "40px" }} />
          ) : (
            <img src={Logo} alt="Expanded Logo" style={{ width: "120px", height: "40px" }} />
          )}
        </div>

        <Menu mode="inline" style={{ backgroundColor: "#293846" }} theme="dark" onClick={handleMenuClick}>
          <SubMenu key="home" icon={<HomeOutlined />} title="Dashboard" style={{ backgroundColor: "#293846", color: "black" , fontSize: "14px", fontWeight: "700" }}>
            <Menu.Item key="dashboard" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Dashboard</Menu.Item>
            <Menu.Item key="Communicationstatistics" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Communication Statistics</Menu.Item>
            <Menu.Item key="DataAvailability" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Data Availability 30 days</Menu.Item>
          </SubMenu>
          <SubMenu key="configurations" icon={<UserOutlined />} title="Configurations" style={{ backgroundColor: "#293846", color: "black" , fontSize: "14px", fontWeight: "700" }}>
            <Menu.Item key="eventmapping" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Event Mapping</Menu.Item>
          </SubMenu>
          <SubMenu key="settings" icon={<SettingOutlined />} title="Meter Details" style={{ backgroundColor: "#293846", color: "black" , fontSize: "14px", fontWeight: "700" }}>
            <Menu.Item key="meterdetails" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Meter Details</Menu.Item>
            <Menu.Item key="GrouponDemand" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Group OnDemand Control</Menu.Item>
            <Menu.Item key="Reconnect" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Reconnect Screen</Menu.Item>
          </SubMenu>
          <SubMenu key="Others" icon={<UserOutlined />} title="Others" style={{ backgroundColor: "#293846", color: "black" , fontSize: "14px", fontWeight: "700" }}>
            <Menu.Item key="transactionlog" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Transaction Log</Menu.Item>
            <Menu.Item key="alarms" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Alarms</Menu.Item>
            <Menu.Item key="meterping" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Meter Ping</Menu.Item>
          </SubMenu>
          <SubMenu key="Reports" icon={<AppstoreOutlined />} popupClassName="scrollable-popup" title="Reports" style={{ backgroundColor: "#293846", color: "black" , fontSize: "14px", fontWeight: "700" }}>
            <Menu.Item key="communicationreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Communication Report</Menu.Item>
            <Menu.Item key="noncommunicationreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Non Communication Report</Menu.Item>
            <Menu.Item key="devicemaster" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Device Master</Menu.Item>
            <Menu.Item key="commfailurereport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Comm Failure Report</Menu.Item>
            <Menu.Item key="cmritransreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>CMRI Transaction Report</Menu.Item>
            <Menu.Item key="simchangereport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Sim Change Report</Menu.Item>
            <Menu.Item key="rtcdriftreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>RTC Drift Report</Menu.Item>
            <Menu.Item key="configurationreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Configuration Report</Menu.Item>
            <Menu.Item key="dataavailabilityreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Data Availability Report</Menu.Item>
            <Menu.Item key="automappedmetersreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Auto Mapped Meters Report</Menu.Item>
            <Menu.Item key="detailedslareport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Detailed SLA Report</Menu.Item>
            <Menu.Item key="timesynchronization" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Time Synchronization</Menu.Item>
            <Menu.Item key="exceptionreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Exception Report</Menu.Item>
            <Menu.Item key="connectdisconnectreport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>Connect Disconnect Report</Menu.Item>
            <Menu.Item key="slareport" style={{ paddingLeft: "30px", fontSize: "11px" , fontWeight: "500" }}>SLA Report</Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 60 : 200, transition: "all 0.3s ease" }}>
        {/* Header */}
        <Header
          style={{
            position: "fixed",
            top: 0,
            zIndex: 1000,
            width: `calc(100% - ${collapsed ? 60 : 200}px)`,
            padding: "0 16px",
            background: "#f3f3f4",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "50px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h4 style={{ margin: 0 , color:"#293846"}}>UHES</h4>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: "10px", border:"2px solid #0081c2", borderRadius:"5px" , backgroundColor:"#0081c2", color:"white", width:"30px", height:"26px"}}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
            <AutoComplete
              style={{ width: 250, marginLeft:'35px' }}
              options={filteredItems.map((item) => ({ value: item.key, label: item.title }))}
              onSearch={handleSearch}
              onSelect={handleSearchSelect}
            >
              <Input
                prefix={<SearchOutlined />}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.length >= 4) {
                    const matchedItem = menuItems.find((item) =>
                      item.title.toLowerCase().includes(searchTerm.toLowerCase())
                    );
 
                    if (matchedItem) {
                      setActiveKey(matchedItem.key);
                      setTabs((prev) => {
                        if (prev.some((tab) => tab.key === matchedItem.key)) {
                          return prev;
                        }
                        return [...prev, { key: matchedItem.key, title: matchedItem.title }];
                      });
                    }
                  }
                }}
              />
            </AutoComplete>
          </div>
          <div
            onClick={() => setIsHovered((prev)=>!prev)}
            style={{ position: "relative", cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={faUser} color="#1890ff" />
            <span style={{ marginLeft: "8px", fontWeight: "bolder", color: "#1890ff" }}>{username}</span>
            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  backgroundColor: "#fff",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  borderRadius: "5px",
                  zIndex: 1000,
                  width: "150px",
                  padding: "10px",
                }}
              >
                <span style={{ cursor: "pointer", fontWeight: "bold", color: "black" }} onClick={() => alert("Profile Clicked")}>Profile</span><br/>
                <span style={{ cursor: "pointer", fontWeight: "bold", color: "black" }} onClick={handleLogout}>Logout</span>
              </div>
            )}
          </div>
        </Header>

        {/* Content */}
        <Content style={{ marginTop: "52px", padding: "6px" }}>
          <Tabs
            hideAdd
            onChange={handleTabChange}
            activeKey={activeKey}
            type="editable-card"
            onEdit={(targetKey, action) => {
              if (action === 'remove') {
                handleTabClose(targetKey);
              }
            }}
          >
            {tabs.map((tab) => (
              <TabPane tab={tab.title} key={tab.key}>
                {componentsMap[tab.key] ? React.createElement(componentsMap[tab.key]) : null}
              </TabPane>
            ))}
          </Tabs>
          <MaxTabsDialog
            open={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);

              // Ensure an active tab is set after closing the dialog
              setActiveKey((prevActiveKey) => {
                return tabs.length > 0 ? prevActiveKey || tabs[tabs.length - 1].key : null;
              });
            }}
          />
          
        </Content>
      </Layout>
    </Layout>
  );
};
export default Hello;
