import React, { Fragment, useEffect, useState } from "react";
import { DetailsList, SelectionMode } from "@fluentui/react";
import axios from "axios";
import { Waypoint } from "react-waypoint"

function App() {
  const [items, setItems] = useState([]);
  const [dataa, setData] = useState([]);
  const [columns, setColumns] = useState();
  const [, setFlag] = useState(false);
  const [parPage] = useState(20);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const columnss = [{
      key: 'column1',
      name: 'UserID',
      fieldName: 'userId',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column2',
      name: 'ID',
      fieldName: 'id',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column3',
      name: 'Title',
      fieldName: 'title',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column4',
      name: 'Body',
      fieldName: 'body',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      data: ' ',
      isPadded: true,
    }];
    setColumns(columnss);
    const getItems = async () => {
      const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts");
      const newData = data.map((e, i) => {
        return i % parPage === 0 ? data.slice(i, i + parPage) : null;
      }).filter(e => { return e; })
      setData(newData);
      setItems(newData[0]);
    }
    getItems();
  }, [])

  const onEnter = () => {
    if (active < dataa.length && (active !== 0)) {
      setItems([...items, ...dataa[active]])
      setActive(active + 1);
    } else {
      setActive(active + 1);
    }
    setFlag(false)
  }

  return (
    <Fragment>
      <DetailsList
        selectionMode={SelectionMode.none}
        items={items}
        columns={columns}
      />
      <Waypoint onLeave={() => onEnter()} />
    </Fragment>
  );
}

export default App;
