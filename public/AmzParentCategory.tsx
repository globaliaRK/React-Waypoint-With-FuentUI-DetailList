import React, { Fragment, useState, useEffect } from 'react';
import { HTMLTable, NonIdealState, Button, Colors, Dialog, Toaster, Position } from '@blueprintjs/core';
import API, { graphqlOperation } from '@aws-amplify/api';
import { Typography, Grid, Switch, LinearProgress } from '@material-ui/core';
import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';
import MUIDataTable from "mui-datatables";
import { makeStyles, withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import ReactDataSheet from 'react-datasheet';
import 'react-datasheet/lib/react-datasheet.css';

import { deleteAmzParentCategory, updateAmzParentCategory, createTableLog } from '../../../../graphql/mutations';
import { getAcFormProj, listAmzParentCategorys, listTableLogs } from '../../../../graphql/queries';
import TableLog from '../../../Common/TableLog';

const useStyles = makeStyles(theme => ({
  hover: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.07)'
    },
    borderBottom: "1px silver solid"
  },
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  table: {
    '& input.data-editor': {
      height: '100% !important',
    },
    '& td': {
      padding: '3px !important'
    }
  }
}));

const themes = createMuiTheme({
  overrides: {
    MuiPaper: {
      elevation2: {
        maxHeight: '300px !important',
        '& > div': {
          height: '100%'
        }
      }
    }
  }
});

const AntSwitch = withStyles(theme => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(12px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: 'none',
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
  checked: {},
}))(Switch);

export const ShowToaster = Toaster.create({
  className: "toaster",
  position: Position.TOP
});

const GetAcFormProj = gql`${getAcFormProj}`;

const ListAmzParentCategorys = gql`${listAmzParentCategorys}`

interface IBrowserTableProps {
  slugName: string;
  siteId: string;
  onEdit: any;
}

interface Data {
  getAcFormProj: any
};

interface Variables {
  siteId: string;
  slugName: string;
};

const AmzParentCategory: React.FC<IBrowserTableProps> = ({ siteId, slugName, onEdit }) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [token, setToken] = useState('');
  const [tableData, setTableData] = useState([]);
  const [allDetail, setAllDetail] = useState([]);
  const [loaderData, setLoaderData] = useState(true);
  const [confirmDeleteModal, setconfirmDeleteModal] = useState(false);
  const [selectedData, setselectedData] = useState();
  const [selectedIndex, setselectedIndex] = useState();
  const [grids, setGrid]: any = useState([]);
  const [switchState, setSwitchState] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [afterSearchData, setAfterSearchData] = useState([]);
  const [logData, setLogData] = useState();
  const [selectedRow, setSelectedRow] = useState();

  useEffect((): any => {
    getToken();
    getTableLog();
  }, []);

  useEffect(() => {
    loadAllParentCategoryItems(1000);
  }, [token]);

  const getToken = async () => {
    if (slugName === "amz-parent-category") {
      const list: any = await API.graphql(graphqlOperation(ListAmzParentCategorys, { "limit": 100 }));
      if (list) {
        let allData: any = tableData.concat(list.data.listAmzParentCategorys['items']);
        let final: any = [];
        list.data.listAmzParentCategorys['items'].map((data: any) => {
          final.push([
            { value: data.siteId, readOnly: true },
            { value: data.slugName, readOnly: true },
            { value: data.name }
          ])
        });
        setGrid(final);
        setTableData(allData);
        setAfterSearchData(allData);
        setAllDetail(allData);
        setToken(list.data.listAmzParentCategorys.nextToken);
        setLoaderData(false);
      }
    }
  }

  const getTableLog = async () => {
    const list: any = await API.graphql(graphqlOperation(listTableLogs, {
      "limit": 100,
      "filter": {
        "tableName": { "contains": "AmzParentCategory-wviufksoljg6rfoawkhnk6fnjq-acdemo" }
      },
    }));
    let data: any = list.data.listTableLogs.items.sort(function (a: any, b: any) {
      return (+(new Date(b.createdAt)) - (+new Date(a.createdAt)));
    });
    setLogData(data);
  }

  function uniq(a: any, param: any) {
    return a.filter(function (item: any, pos: any, array: any) {
      return array.map(function (mapItem: any) { return mapItem[param]; }).indexOf(item[param]) === pos;
    })
  }

  const loadParentCategoryItems = async (recordLimit: any) => {
    if (token) {
      setLoaderData(true);
      let list: any = await API.graphql(graphqlOperation(ListAmzParentCategorys, { limit: recordLimit, nextToken: token || null }));
      if (list.data.listAmzParentCategorys['items']) {
        let allData: any = tableData.concat(list.data.listAmzParentCategorys['items']);
        setTableData(allData);
        setToken(list.data.listAmzParentCategorys['nextToken']);
        setLoaderData(false);
      }
    } else {
      setLoaderData(false);
    }
  }

  const loadAllParentCategoryItems = async (recordLimit: any) => {
    if (token) {
      let list: any = await API.graphql(graphqlOperation(ListAmzParentCategorys, { limit: recordLimit, nextToken: token || null }));
      if (list.data.listAmzParentCategorys['items']) {
        let allData: any = allDetail.concat(list.data.listAmzParentCategorys['items']);
        setAllDetail(allData);
        setToken(list.data.listAmzParentCategorys['nextToken']);
      }
    } else {
      setLoaderData(false);
    }
  }

  const changePage = (pageNumber: any, rowsPerPage: any) => {
    if (pageNumber < page) {
      setPage(pageNumber);
    } else {
      if (rowsPerPage !== null) {
        rowsPerPage === allDetail.length ? setTableData(allDetail) : loadParentCategoryItems(rowsPerPage);
      } else {
        loadParentCategoryItems(10);
      }
      setPage(pageNumber);
    }
  };

  const searchQuery = async (queryString: any) => {
    setSearchString(queryString);
    let list: any = await API.graphql(graphqlOperation(listAmzParentCategorys, {
      "limit": 200,
      "filter": {
        "or": [
          { "slugName": { "contains": queryString } },
          { "name": { "contains": queryString } }
        ]
      }
    }));

    if (list.data.listAmzParentCategorys['items']) {
      let final: any = [];
      list.data.listAmzParentCategorys['items'].map((data: any) => {
        final.push([
          { value: data.siteId, readOnly: true },
          { value: data.slugName, readOnly: true },
          { value: data.name }
        ])
      });
      setGrid(final);
      setTableData(list.data.listAmzParentCategorys['items']);
      setToken(list.data.listAmzParentCategorys['nextToken']);
    }
  }

  const columns: any = [
    {
      name: "Action",
      options: {
        filter: false,
        print: false,
        download: false,
        searchable: false,
        sort: false
      }
    },
    {
      name: "siteId",
      options: {
        display: "false",
        filter: false,
      }
    },
    {
      name: "slugName",
      options: {
        filter: true,
      }
    },
    {
      name: "name",
      options: {
        filter: true,
      }
    }
  ];

  const options: any = {
    selectableRows: "none",
    responsive: 'scrollMaxHeight',
    page: page,
    rowsPerPage: 100,
    rowsPerPageOptions: [100, 250, 500, 1000, allDetail.length],
    onTableChange: (action: any, tableState: any) => {
      switch (action) {
        case 'changePage':
          changePage(tableState.page, null);
          break;
        case 'changeRowsPerPage':
          changePage(tableState.page, tableState.rowsPerPage);
          break;
        case 'search':
          if (tableState.searchText && tableState.searchText.length >= 3) {
            searchQuery(tableState.searchText);
          }
          break;
        case 'onSearchClose':
          setTableData([]);
          setSearchString('');
          break;
        case 'propsUpdate':
          setTableData(afterSearchData);
          break;
      }
    },
    customRowRender: (data: any) => {
      const [createdAt, siteId, slugName, name] = data;
      let payload = {
        siteId: siteId,
        slugName: slugName,
        name: name
      }

      return (
        <tr key={slugName} className={classes.hover}>
          <td className="MuiTableCell-root" style={{ padding: "4px 7px 6px 5px" }}>
            <span style={{ display: 'flex' }}>
              <Button icon="edit" color={Colors.GREEN1} text="Edit" onClick={() => onEdit(payload)} />
              <Button icon="key-delete" color={Colors.RED1} text="Delete" style={{ marginLeft: 4 }} onClick={() => [setselectedData(payload), setconfirmDeleteModal(true)]} />
            </span>
          </td>
          <td className="MuiTableCell-root" style={{ padding: "4px 7px 6px 5px" }}>{slugName}</td>
          <td className="MuiTableCell-root" style={{ padding: "4px 7px 6px 5px" }}>{name}</td>
        </tr>
      );
    }
  };

  const DeleteAmzParentCategoryData = async (data: any) => {
    const todoDetails = { slugName: data.slugName, siteId: data.siteId }
    let deleteResponse: any = await API.graphql(graphqlOperation(deleteAmzParentCategory, { input: todoDetails }));
    if (deleteResponse.data.deleteAmzParentCategory) {
      setselectedData(null);
      setconfirmDeleteModal(false)
      setselectedIndex(null);
      let AmzParentData = JSON.parse(JSON.stringify(tableData));
      AmzParentData.splice(selectedIndex, 1);
      setTableData(AmzParentData);
      ShowToaster.show({ message: "Record successfully deleted" });
    } else {
      ShowToaster.show({ message: "something went wrong" });
    }
  }

  const cellChange = async (changes: any) => {
    const grid = grids.map((row: any) => [...row]);
    changes.forEach(async (cell: any) => {
      let inputVar: any = { siteId: grid[cell.row][0].value, slugName: grid[cell.row][1].value };
      let logInput: any = {
        userId: localStorage.getItem("userId"),
        userName: localStorage.getItem("username"),
        tableName: "AmzParentCategory-wviufksoljg6rfoawkhnk6fnjq-acdemo",
        oldValue: selectedRow,
        changeValue: cell.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (cell.col === 2) {
        inputVar.name = cell.value;
        logInput.columnName = "name";
      }
      await API.graphql(graphqlOperation(updateAmzParentCategory, { input: inputVar }));
      let createTableData: any = await API.graphql(graphqlOperation(createTableLog, { input: logInput }));
      if (createTableData) {
        logData.unshift(createTableData.data.createTableLog);
        setLogData(logData);
      }
      grid[cell.row][cell.col] = { ...grid[cell.row][cell.col], value: cell.value }
    })
    setGrid(grid);
  }

  return (
    <Query<Data, Variables> query={GetAcFormProj} variables={{ siteId, slugName }} fetchPolicy="cache-and-network">
      {({ loading, error, data }) => {
        // if (loading) return <p>"Loading "</p>;
        if (data === undefined || data.getAcFormProj === null) {
          return (
            <NonIdealState
              icon="zoom-out"
              title="No records present"
            />
          )
        }
        if (data !== undefined && data.getAcFormProj !== null && Object.keys(data).length) {
          if (data.getAcFormProj.slugName === "amz-parent-category") {
            return (
              <Fragment>
                <Typography component="div">
                  <Grid component="label" container alignItems="center" spacing={1}>
                    <Grid item>View</Grid>
                    <Grid item>
                      <AntSwitch
                        checked={switchState}
                        onChange={() => setSwitchState(!switchState)}
                      />
                    </Grid>
                    <Grid item>Edit</Grid>
                  </Grid>
                </Typography>
                {loaderData &&
                  <div className={classes.root}>
                    <LinearProgress />
                  </div>
                }
                {switchState === false &&
                  <MuiThemeProvider theme={themes}>
                    <MUIDataTable
                      title={"AWS Parent Category List"}
                      data={tableData}
                      columns={columns}
                      options={options}
                    />
                  </MuiThemeProvider>
                }
                {switchState === true &&
                  <div>
                    <TableLog logData={logData} /><br />
                    <ReactDataSheet
                      data={grids}
                      valueRenderer={(cell: any) => cell.value}
                      onCellsChanged={changes => cellChange(changes)}
                      onSelect={(start: any) => { setSelectedRow(grids[start.start.i][start.start.j].value) }}
                      sheetRenderer={props => {
                        return (
                          <table className={props.className + ' my-awesome-extra-class ' + classes.table}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'center', border: "0.1rem solid #DDD" }}>siteId</th>
                                <th style={{ textAlign: 'center', border: "0.1rem solid #DDD" }}>slugName</th>
                                <th style={{ textAlign: 'center', border: "0.1rem solid #DDD" }}>Name</th>
                              </tr>
                            </thead>
                            <tbody>
                              {props.children}
                            </tbody>
                          </table>
                        )
                      }}
                    />
                  </div>
                }
                <Dialog
                  isOpen={confirmDeleteModal}
                  isCloseButtonShown={true}
                  icon="info-sign"

                  hasBackdrop={true}
                  onClose={() => setconfirmDeleteModal(false)}
                  title="Are you sure you want to delete this record?" >
                  <div className="bp3-dialog-body">
                    {selectedData &&
                      <h4>Name : {selectedData.name}</h4>
                    }
                  </div>
                  <div className="bp3-dialog-footer">
                    <div className="bp3-dialog-footer-actions">
                      <button type="button" className="bp3-button bp3-intent-danger" onClick={() => [DeleteAmzParentCategoryData(selectedData)]}>Delete</button>
                      <button type="submit" className="bp3-button bp3-intent-primary" onClick={() => [setselectedData(null), setconfirmDeleteModal(false)]}>Cancel</button>
                    </div>
                  </div>
                </Dialog>
              </Fragment>
            );
          } else {
            return (
              <></>
            )
          }
        } else {
          return (
            <></>
          )
        }
      }}
    </Query>
  );

};


export default AmzParentCategory;


