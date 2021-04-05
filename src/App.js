import React, { Fragment, useEffect, useState } from "react";
import { DetailsList, DetailsRow, SelectionMode } from "@fluentui/react";
import axios from "axios";
import { Waypoint } from "react-waypoint"

function App() {
  const [items, setItems] = useState([]);
  const [dataa, setData] = useState([]);
  const [columns, setColumns] = useState();
  const [parPage] = useState(20);
  const [active, setActive] = useState(1);

  useEffect(() => {
    const columnss = [{
      key: 'column1',
      name: 'UserID',
      fieldName: 'userId',
      className: "py-3 h5",
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
      className: "py-3 h5",
      isResizable: true,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column3',
      name: 'Title',
      fieldName: 'title',
      minWidth: 70,
      className: "py-3 h5",
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
      className: "py-3 h5",
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
      }).filter(e => e)
      setData(newData);
      setItems(newData[0]);
    }
    getItems();
  }, [])

  const onEnter = async () => {
    if (active < dataa.length) {
      setItems([...items, ...dataa[active]])
      setActive(active + 1);
    }
  }

  return (
    <Fragment>
      <DetailsList
        selectionMode={SelectionMode.none}
        onRenderRow={(props) => <DetailsRow className="py-3 h5" {...props} />}
        items={items}
        columns={columns} />
      <Waypoint onEnter={onEnter} />
    </Fragment>
  );
}

export default App;
