"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Tabs } from "antd"
import { MaxTabsDialog } from "../../Meter_Details/MeterDetails/MeterTabslimit"
import DisplayConfiguration from "./DisplayConfiguration"
import DisplayparameterConfiguration from "./DisplayparameterConfiguration"
import DisplayparameterUpdate from "./DisplayparameterUpdate"

const MAX_TABS = 7

const DisplayConfigurationTabs = () => {
  const [activeKey, setActiveKey] = useState("1")
  const tabHistory = useRef(["1"])
  const [tabs, setTabs] = useState([
    {
      key: "1",
      label: "Display Configuration",
      closable: false,
      component: "DisplayConfiguration",
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (tabs.length > 0) {
      setActiveKey(tabs[tabs.length - 1].key)
    }
  }, [tabs])

  const handleTabClick = useCallback((rowData, componentType) => {
    const newKey = `${componentType}-${rowData.displayConfigName || rowData.paramName || 'new'}`

    setTabs((prevTabs) => {
      const existingTab = prevTabs.find((tab) => tab.key === newKey)
      if (!existingTab) {
        if (prevTabs.length < MAX_TABS) {
          tabHistory.current.push(newKey)
          return [
            ...prevTabs,
            {
              key: newKey,
              label: `${componentType} - ${rowData.displayConfigName || rowData.paramName || 'New'}`,
              closable: true,
              component: componentType,
              data: rowData,
            },
          ]
        } else {
          setIsDialogOpen(true)
          return prevTabs
        }
      }
      return prevTabs
    })

    setActiveKey(newKey)
  }, [])

  const handleEdit = useCallback((targetKey, action) => {
    if (action === "remove") {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.key !== targetKey)
        tabHistory.current = tabHistory.current.filter((key) => key !== targetKey)

        const previousKey = tabHistory.current[tabHistory.current.length - 1] || "1"
        setActiveKey(previousKey)

        return newTabs
      })
    }
  }, [])

  const handleTabChange = useCallback((key) => {
    tabHistory.current.push(key)
    setActiveKey(key)
  }, [])

  const tabItems = useMemo(
    () =>
      tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        children:
          tab.component === "DisplayConfiguration" ? (
            <DisplayConfiguration onTabClick={handleTabClick} />
          ) : tab.component === "DisplayparameterConfiguration" ? (
            <DisplayparameterConfiguration data={tab.data} />
          ) : tab.component === "DisplayparameterUpdate" ? (
            <DisplayparameterUpdate data={tab.data} />
          ) : null,
        closable: tab.closable,
      })),
    [tabs, handleTabClick],
  )

  return (
    <>
      <Tabs
        type="editable-card"
        hideAdd
        activeKey={activeKey}
        onChange={handleTabChange}
        onEdit={handleEdit}
        items={tabItems}
      />
      <MaxTabsDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  )
}

export default DisplayConfigurationTabs
