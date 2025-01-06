import { useState, useCallback, useMemo, useEffect } from "react";
import { Layout, Menu, Tabs, Button, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  HomeOutlined,
  UserOutlined,
  SearchOutlined,
  SettingOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Dashboard from "./Components/Dashboard/Dashboard_main/Dashboard";
import DataAvailabilitys from "./Components/charts/DataAvailabilitys";
import MeterDetails from "./Components/Meter_Details/MeterDetails/MeterDetail";
import Logo from "../src/Assets/images/logo.png";
import Logo1 from "../src/Assets/images/img5.png";
import Reconnectreload from "./Components/Meter_Details/ReconnectScreen/ReconnectReload";
import GroupOnDemandControlreload from "./Components/Meter_Details/GroupOnDemandControl/GroupOnDemandControlReload";
import CommunicationStatistics from "./Components/Dashboard/Communication Statistics/CommunicationStatisticsreload";
import "./Layout.css"; 
import TransactionLogcontrol from "./Components/Others/TransactionLogcontrol";
import Alarms from "./Components/Others/Alarms";

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;
const { SubMenu } = Menu;

const componentsMap = {
  dashboard: Dashboard,
  DataAvailability: DataAvailabilitys,
  meterdetails: MeterDetails,
  GrouponDemand: GroupOnDemandControlreload,
  Reconnect: Reconnectreload,
  Communicationstatistics: CommunicationStatistics,
  transactionlog: TransactionLogcontrol,
  alarms: Alarms,
};

const Hello = () => {
  const navigate = useNavigate();

  const [sidebarState, setSidebarState] = useState({
    collapsed: true,
    hovered: false,
    fixedExpanded: false,
    openKey: "",
  });
  const [activeKey, setActiveKey] = useState("dashboard");
  const [tabs, setTabs] = useState([{ key: "dashboard", title: "Dashboard" }]);
  const username = sessionStorage.getItem("username");
  const [isHovered, setIsHovered] = useState(false);

  const siderWidth = useMemo(
    () => (sidebarState.collapsed && !sidebarState.hovered ? 60 : 200),
    [sidebarState.collapsed, sidebarState.hovered]
  );

  const toggleFixedExpanded = useCallback(() => {
    setSidebarState((prev) => ({
      ...prev,
      fixedExpanded: !prev.fixedExpanded,
      collapsed: !prev.collapsed,
    }));
  }, []);

  const handleSiderHover = useCallback((hovered) => {
    setSidebarState((prev) => {
      if (prev.fixedExpanded) return prev;
      return { ...prev, hovered };
    });
  }, []);

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
    []
  );

  const handleOpenChange = useCallback((keys) => {
    const latestOpenKey = keys.find(
      (key) => key !== sidebarState.openKey
    );
    setSidebarState((prev) => ({
      ...prev,
      openKey: latestOpenKey || "",
    }));
  }, [sidebarState.openKey]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarState((prev) => ({
          ...prev,
          collapsed: true,
          fixedExpanded: false,
        }));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = useCallback(({ key }) => {
    setActiveKey(key);
    setTabs((prev) => {
      if (prev.some((tab) => tab.key === key)) {
        return prev;
      }
      return [...prev, { key, title: key.charAt(0).toUpperCase() + key.slice(1) }];
    });
  }, []);

  return (
    <Layout
      style={{ minHeight: "100vh" }}
      className={sidebarState.collapsed ? "sider-collapsed" : "sider-expanded"}
    >
      <Sider
        collapsed={sidebarState.collapsed && !sidebarState.hovered && !sidebarState.fixedExpanded}
        onMouseEnter={() => handleSiderHover(true)}
        onMouseLeave={() => handleSiderHover(false)}
        width={200}
        collapsedWidth={60}
        style={{
          position: "fixed",
          height: "100vh",
          transition: "all 0.3s ease",
          backgroundColor: "#089bab",
        }}
      >
        <div className="logo" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "64px" }}>
          {sidebarState.collapsed && !sidebarState.hovered ? (
            <img src={Logo1} alt="Collapsed Logo" style={{ width: "40px", height: "40px" }} />
          ) : (
            <img src={Logo} alt="Expanded Logo" style={{ width: "120px", height: "40px" }} />
          )}
        </div>
        <Menu
          style={{ backgroundColor: "#089bab" }}
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={[sidebarState.openKey]}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
        >
          <SubMenu key="home" icon={<HomeOutlined />} title="Dashboard">
            <Menu.Item key="dashboard" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Dashboard</Menu.Item>
            <Menu.Item key="Communicationstatistics" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Communication Statistics</Menu.Item>
            <Menu.Item key="DataAvailability" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Data Availability 30 days</Menu.Item>
          </SubMenu>
          <SubMenu key="profile" icon={<UserOutlined />} title="Configurations">
            <Menu.Item key="profile-1 " style={{ paddingLeft: "30px" , fontSize:'11px' }}>Configuration 1</Menu.Item>
          </SubMenu>
          <SubMenu key="settings" icon={<SettingOutlined />} title="Meter Details">
            <Menu.Item key="meterdetails" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Meter Details</Menu.Item>
            <Menu.Item key="GrouponDemand" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Group OnDemand Control</Menu.Item>
            <Menu.Item key="Reconnect" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Reconnect Screen</Menu.Item>
          </SubMenu>
          <SubMenu key="Others" icon={<UserOutlined />} title="Others">
            <Menu.Item key="transactionlog" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Transaction Log</Menu.Item>
            <Menu.Item key="alarms" style={{ paddingLeft: "30px" , fontSize:'11px' }}>Alarms</Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>

      <Layout style={{ marginLeft: siderWidth, transition: "margin-left 0.3s ease" }}>
        <Header
          style={{
            position: "fixed",
            top: 0,
            width: `calc(100% - ${siderWidth}px)`,
            zIndex: 1000,
            padding: "0 16px",
            background: "#089bab",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "50px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button type="text" icon={<MenuOutlined />} onClick={toggleFixedExpanded} />
            <Input placeholder="Search Menu" prefix={<SearchOutlined />} style={{ width: 200 }} />
          </div>
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: "relative" }}
          >
            <FontAwesomeIcon icon={faUser} color="orange" />
            <span style={{ fontWeight: "bolder", color: "orange" }}>{username}</span>
            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  backgroundColor: "#fff",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  borderRadius: "5px",
                  zIndex: 1000,
                  width: "150px",
                  padding: "10px",
                }}
              >
                <div style={{ cursor: "pointer", fontWeight: "bold", color: "black" }} onClick={() => alert("Profile Clicked")}>
                  Profile
                </div>
                <div style={{ cursor: "pointer", fontWeight: "bold", color: "black" }}>
                  <Link to="/">Logout</Link>
                </div>
              </div>
            )}
          </div>
        </Header>
        <Content
          style={{
            marginTop: 55,
            padding: "10px",
            background: "white",
            overflowY: "auto",
            height: `calc(100vh - 64px)`,
          }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            type="editable-card"
            onEdit={(targetKey, action) => action === "remove" && handleTabClose(targetKey)}
            style={{
              position: "sticky",
              top: 0, // This aligns the tabs to stick just below the header
              zIndex: 999, // Ensure it's above the content but below the header
              backgroundColor: "white", // Maintain background consistency
              padding: "10px 0", // Optional: Add some padding for better visuals
            }}
          >
            {tabs.map(({ key, title }) => {
              const Component = componentsMap[key];
              return (
                <TabPane tab={title} key={key}>
                  {Component ? <Component /> : <div>Component not found!</div>}
                </TabPane>
              );
            })}
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Hello;