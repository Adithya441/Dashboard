import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Layout, Menu, Tabs, Button, Input } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { 
  HomeOutlined, 
  UserOutlined, 
  SearchOutlined, 
  SettingOutlined, 
  MenuOutlined 
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Dashboard from "./Components/Dashboard/Dashboard_main/Dashboard";
import DataAvailability from "./Components/charts/DataAvailability";
import Metertabs from "./Components/Meter_Details/MeterDetails/Metertabs";
import Logo from "../src/Assets/images/logo.png";
import Logo1 from "../src/Assets/images/img5.png";
import Reconnectreload from "./Components/Meter_Details/ReconnectScreen/ReconnectReload";
import GroupOnDemandControlreload from "./Components/Meter_Details/GroupOnDemandControl/GroupOnDemandControlReload";
import CommunicationStatistics from "./Components/Dashboard/Communication Statistics/CommunicationStatistics";
import "./Layout.css";
import TransactionLog from "./Components/Others/Transactionlog";

const { Header, Sider, Content, Footer } = Layout;
const { TabPane } = Tabs;
const { SubMenu } = Menu;

const componentsMap = {
  dashboard: Dashboard,
  DataAvailability: DataAvailability,
  meterdetails: Metertabs,
  GrouponDemand: GroupOnDemandControlreload,
  Reconnect: Reconnectreload,
  Communicationstatistics: CommunicationStatistics,
  transactionlog: TransactionLog,
};

const Hello = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [fixedExpanded, setFixedExpanded] = useState(false);
  const [activeKey, setActiveKey] = useState("dashboard");
  const [tabs, setTabs] = useState([{ key: "dashboard", title: "Dashboard" }]);
  const username = sessionStorage.getItem("username")
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = useMemo(
    () => [
      { key: "dashboard", title: "Dashboard", icon: <HomeOutlined /> },
      {
        key: "DataAvailability",
        title: "Data Availability 30 days",
        icon: <HomeOutlined />,
      },
      { key: "GrouponDemand", title: "Group OnDemand Control", icon: <UserOutlined /> },
      { key: "meterdetails", title: "Meter Details", icon: <SettingOutlined /> },
      { key: "Reconnect", title: "Reconnect Screen", icon: <SettingOutlined /> },
      { key: "Communicationstatistics", title: "Communication Statistics", icon: <SettingOutlined /> },
      { key: "transactionlog", title: "Transaction Log", icon: <SettingOutlined /> },
    ],
    []
  );

  const toggleFixedExpanded = useCallback(() => {
    setFixedExpanded((prev) => !prev);
    setCollapsed((prev) => !prev);
  }, []);

  const handleMenuClick = useCallback(({ key }) => {
    setActiveKey(key);
    setTabs((prevTabs) => {
      if (prevTabs.some((tab) => tab.key === key)) {
        return prevTabs;
      }
      return [...prevTabs, { key, title: key.charAt(0).toUpperCase() + key.slice(1) }];
    });
  }, []);

  const handleTabClose = useCallback(
    (targetKey) => {
      setTabs((prevTabs) => {
        if (prevTabs.length === 1) return prevTabs;
        const filteredTabs = prevTabs.filter((tab) => tab.key !== targetKey);
        if (activeKey === targetKey && filteredTabs.length > 0) {
          setActiveKey(filteredTabs[filteredTabs.length - 1].key);
        }
        return filteredTabs;
      });
    },
    [activeKey]
  );

  const handleSearch = useCallback(
    (value) => {
      const matchedItem = menuItems.find((item) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      if (matchedItem) {
        handleMenuClick({ key: matchedItem.key });
      }
    },
    [menuItems, handleMenuClick]
  );

  const handleSignOut = () => {
    sessionStorage.clear(); // Clear sessionStorage
    navigate("/"); // Redirect to login page
  };

  const siderWidth = useMemo(
    () => (collapsed && !hovered ? 60 : 200),
    [collapsed, hovered]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
        setFixedExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }} className={collapsed ? "sider-collapsed" : "sider-expanded"}>
      <Sider
        collapsed={collapsed && !hovered && !fixedExpanded}
        onMouseEnter={() => !fixedExpanded && setHovered(true)}
        onMouseLeave={() => !fixedExpanded && setHovered(false)}
        width={200}
        collapsedWidth={60}
        style={{
          position: "fixed",
          height: "100vh",
          transition: "all 0.3s ease",
          backgroundColor: "#089bab",
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
          {collapsed && !hovered ? (
            <img
              src={Logo1}
              alt="Collapsed Logo"
              style={{ width: "40px", height: "40px", transition: "opacity 0.3s ease" }}
            />
          ) : (
            <img
              src={Logo}
              alt="Expanded Logo"
              style={{ width: "120px", height: "40px", transition: "opacity 0.3s ease" }}
            />
          )}
        </div>

        <Menu
          style={{ backgroundColor: "#089bab" }}
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={handleMenuClick}
        >
          <SubMenu key="home" icon={<HomeOutlined />} title="Dashboard">
            <Menu.Item key="dashboard" style={{ fontSize: "10px" }}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="Communicationstatistics" style={{ fontSize: "10px" }}>
              Communication Statistics
            </Menu.Item>
            <Menu.Item key="DataAvailability" style={{ fontSize: "10px" }}>
              Data Availability 30 days
            </Menu.Item>
            
          </SubMenu>
          <SubMenu key="profile" icon={<UserOutlined />} title="Configurations">
            <Menu.Item key="profile-1" style={{ fontSize: "10px" }}>
              Configuration 1
            </Menu.Item>
          </SubMenu>
          <SubMenu key="settings" icon={<SettingOutlined />} title="Meter Details">
            <Menu.Item key="meterdetails" style={{ fontSize: "10px" }}>
              Meter Details
            </Menu.Item>
            <Menu.Item key="GrouponDemand" style={{ fontSize: "10px" }}>
              Group OnDemand Control
            </Menu.Item>
            <Menu.Item key="Reconnect" style={{ fontSize: "10px" }}>
              Reconnect Screen
            </Menu.Item>
          </SubMenu>

          <SubMenu key="Others" icon={<UserOutlined />} title="Others">
            <Menu.Item key="transactionlog" style={{ fontSize: "10px" }}>
              Transaction Log
            </Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>

      <Layout
        style={{
          marginLeft: siderWidth,
          transition: "margin-left 0.3s ease",
        }}
      >
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
            transition: "width 0.3s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={toggleFixedExpanded}
              style={{
                color: fixedExpanded ? "#1890ff" : "#FFFFFF",
              }}
            />
            <Input
              placeholder="Search Menu"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onPressEnter={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: "relative" }}  // Ensure that the dropdown is positioned relative to this div
          >
            <FontAwesomeIcon icon={faUser} color="orange" style={{marginTop:'2px', marginRight:'5px'}} />
            <span
              style={{
                fontWeight: "bolder",
                color: "orange",
                fontSize:'16px',
                padding: "0",
              }}
            >
              {/* Replace username here */}
              {username}
            </span>

            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",  // Position it right below the username
                  left: "0",
                  backgroundColor: "#fff",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  borderRadius: "5px",
                  zIndex: 1000,  // Ensure the dropdown is above other elements
                  width: "150px",
                  marginRight:'5px',
                  padding:'0px'
                }}
              >
                <div
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "black",
                    paddingLeft:'15px'
                  }}
                  onClick={() => alert("Profile Clicked")}
                >
                  Profile
                </div>
                <div
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "black",
                    paddingLeft:'15px'
                  }}
                >
                  <Link to='/'>
                    Logout
                  </Link>
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
            onChange={setActiveKey}
            type="editable-card"
            onEdit={(targetKey, action) => {
              if (action === "remove") {
                handleTabClose(targetKey);
              }
            }}
            className="custom-tabs"
          >
            {tabs.map(({ key, title }) => {
              const Component = componentsMap[key];
              return (
                <TabPane tab={title} key={key} closable={key !== "dashboard"}>
                  {Component ? <Component /> : null}
                </TabPane>
              );
            })}
          </Tabs>
          <Footer
            style={{
              textAlign: 'center',
              height:'30px',
              fontWeight:'700',
              margin:'0px',
              padding:'2px'
            }}
          >
            Powered by Fluentgrid
          </Footer>
        </Content>
        
      </Layout>
    </Layout>
  );
};

export default Hello;
