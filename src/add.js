import React, { useState } from "react";
import { Layout, Menu, Tabs, Button } from "antd";
import { MenuOutlined, HomeOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";

// Import your components
import Dashboard from "./Components/Dashboard/Dashboard";

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

const Add = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState("home"); // Currently active tab
  const [tabs, setTabs] = useState([
    { key: "home", title: "Home", Component: Dashboard }, // Default tab with Home component
  ]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (e) => {
    const { key } = e;

    // Check if tab already exists
    const tabExists = tabs.some((tab) => tab.key === key);

    if (!tabExists) {
      // Map menu keys to components
      const componentsMap = {
        home: Dashboard,
      };

      // Add new tab with the respective component
      const newTab = {
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
        Component: componentsMap[key],
      };
      setTabs([...tabs, newTab]);
    }

    // Set active tab
    setActiveKey(key);
  };

  const handleTabClose = (targetKey) => {
    const filteredTabs = tabs.filter((tab) => tab.key !== targetKey);
    setTabs(filteredTabs);

    // If closing the active tab, switch to the last remaining tab
    if (activeKey === targetKey && filteredTabs.length > 0) {
      setActiveKey(filteredTabs[filteredTabs.length - 1].key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} width={200}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["home"]}
          onClick={handleMenuClick} // Handle menu clicks to open new tabs
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>
            Home
          </Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            Profile
          </Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            Settings
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#001529", padding: "0 16px", color: "#fff" }}>
          <Button
            icon={<MenuOutlined />}
            type="text"
            style={{ color: "#fff", fontSize: "20px" }}
            onClick={toggleSidebar}
          />
          <span style={{ color: "#fff", marginLeft: "16px" }}>Dynamic Tabs with Components</span>
        </Header>
        <Content style={{ margin: "16px", padding: "24px", background: "#fff" }}>
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey} // Change the active tab when clicked
            type="editable-card" // Enables the close button on tabs
            onEdit={(targetKey, action) => {
              if (action === "remove") {
                handleTabClose(targetKey); // Handle tab close
              }
            }}
          >
            {tabs.map(({ key, title, Component }) => (
              <TabPane tab={title} key={key} closable={key !== "home"}>
                {/* Render the corresponding component */}
                <Component />
              </TabPane>
            ))}
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Add;
