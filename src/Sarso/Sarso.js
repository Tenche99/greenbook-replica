import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import projectLogo from "../assets/Images/CTALogo.png";
import Moment from 'moment';
import { red } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import EmailIcon from '@material-ui/icons/Email';
import { makeStyles } from '@material-ui/core/styles';
import { debounce } from "@mui/material";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { AddDialog, EditDialog } from '../Sarso/dialog';
import MaterialTable, { MTableToolbar } from 'material-table';
import { EmailDialog } from '../email/index';
import { Alerts } from '../alerts/index';
import { BackdropComponent } from '../backdrop/index';
import {
  Grid,
  Paper,
  TextField,
  Button
} from '@material-ui/core';
import axios from "axios";
import { oOptions, oTableIcons, sDateFormat, modifyHeaders, sISODateFormat, sDateFormatMUIDatepicker, sDDMMYYYYRegex } from '../config/commonConfig';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { el } from 'date-fns/locale';

import ViewDocuments from '../view-documents/viewDocuments';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    flexGrow: 1,
    'label + &': {
      marginTop: theme.spacing(3)
    }
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(0.5),
    width: '100%'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  box: {
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(1.5)
  },
  button: {
    margin: theme.spacing(1),
  },
  palette: {
    primary: {
      // Purple and green play nicely together.
      main: red[500],
    },
    secondary: {
      // This is green.A700 as hex.
      main: '#11cb5f',
    },
  },
  expansionHeading: {
    color: '#ffffff'
  },
  expansionPanel: {
    backgroundColor: '#4e5287'
  },
}));

const searchArray = []; // ---> For Queueing Search Requests


export default function Sarso() {
  const [openDropdown, setOpenDropdown] = useState(null); // State to track the open dropdown
  const navigate = useNavigate(); // useNavigate for redirection after logout

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in again.");
        navigate("/login"); // Redirect to login if token doesn't exist
        return; // Exit early if no token
      }
  
      console.log("Token:", token);
  
      const response = await fetch("http://localhost/api/User/Logout/", {
        method: "GET", // Change method to GET for your API
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        // Clear token from localStorage
        localStorage.removeItem("token");
  
        // Redirect to login page
        navigate("/login");
      } else if (response.status === 401) {
        console.error("Unauthorized: Invalid or expired token");
        navigate("/login"); // Redirect to login if unauthorized
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error occurred during logout:", error);
    }
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleMouseEnter = (dropdownName) => {
    setOpenDropdown(dropdownName);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  Moment.locale('en');
  const classes = useStyles();
  const [editModal, setEditModal] = React.useState(false);
  const [emailModal, setEmailModal] = React.useState(false);
  const [dataAPI, setdataAPI] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectData, setSelectData] = useState([]);

  const [id, setId] = React.useState('');
  const [nFormNumber, setFormNumber] = React.useState(null);
  const [sAuthRegion, setAuthRegion] = React.useState(null);
  const [authRegions, setAuthRegionsList] = React.useState([]);
  const [dtReceived, setReceivedDate] = React.useState(null);
  const [sName, setName] = React.useState(null);
  const [sFathersName, setFathersName] = React.useState(null);
  const [saney, setSaney] = React.useState(0);
  const [documents, setDocument] = React.useState('');
  const [issueActionDate, setIssueActionDate] = React.useState('');
  const [issueAction, setIssueAction] = React.useState(0);
  const [returnDate, setReturnDate] = React.useState('');
  const [rejectDate, setRejectDate] = React.useState('');
  const [sarsoObj, setSarsoObj] = useState({});
  const [emailInObj, setEmailInObj] = useState({});
  //const [isLoading, setisLoading] = React.useState(true);
  const [backdrop, setBackdrop] = React.useState(false);
  const [viewDocs, setViewDocs] = useState(false);
  const [madebId, setMadebId] = useState(0);


  const [filtering, setFiltering] = React.useState(false);
  oOptions.filtering = filtering;

  //Alert
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const alertObj = {
    alertMessage: alertMessage,
    alertType: alertType
  }
  const [snackbar, setSnackbar] = React.useState(false);
  const snackbarOpen = () => {
    setSnackbar(true);
  }
  const snackbarClose = () => {
    setSnackbar(false);
  };
  const handleEditClickOpen = () => {
    setEditModal(true);
  };
  const handleEditClickClose = () => {
    setEditModal(false);
  };
  const handleAddClickOpen = () => {
    setAddModal(true);
  };
  const handleAddClickClose = () => {
    setAddModal(false);
  };
  const handleEmailClickOpen = () => {
    setEmailModal(true);
  };
  const handleEmailClickClose = (shouldReload) => {
    setEmailModal(false);
    if (shouldReload) {
      //loadData();
      searchFunction(nFormNumber, dtReceived, sAuthRegion, sName, sFathersName);
    }

  };

  const handleDocumentView =(id) => {
    console.log("Madeb id for view documents: ", id);
    setViewDocs(true);
    setMadebId(id);
  }
  const handleDocumentsClose = () => {
    setViewDocs(false);
  }
  const columns = [
    {
      field: "madeb.id",
      title: "#",
      hidden: true,
      export: false,
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle",
        "&:hover": {
          color: "blue"
        },

      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'

      }
    },
    {
      field: "madeb.nFormNumber",
      title: "FORM NO",
      width: "7%",

      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle",

      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'

      }
    },
    {
      field: "madeb.dtFormattedReceived",
      title: "RECEIVED DATE",
      width: "8%",
      // render: rowData => Moment(rowData['madeb']['dtReceived']).format(sDateFormat),
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle",

      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'
      },
      customSort: (a, b) => {
        //console(a, b);
        if (!a.madeb.dtFormattedReceived) {
          return -1;
        }
        if (!b.madeb.dtFormattedReceived) {
          return 1;
        }
        a = a ? a.madeb.dtFormattedReceived.split('-').reverse().join('') : '';
        b = b ? b.madeb.dtFormattedReceived.split('-').reverse().join('') : '';
        return a.localeCompare(b);
      },
    },
    {
      field: "sAuthRegion",
      width: "6%",
      title: "AUTHORITY",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle",

      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'

      }
    },
    {
      field: "madeb.sName",
      title: "FULLNAME",
      width: "30%",
      headerStyle: {
        textAlign: "left",
        textAlignLast: "center",
        verticalAlign: "middle",

      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'
      }
    },

    {
      field: "madeb.sFathersName",
      title: "FATHER'S NAME",
      width: "30%",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'
      }
    },
    {
      field: "madeb.nSaneyFormNo",
      title: "SANEY FORM NO",
      width: "5%",
      hidden: false,
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'
      }
    },
    {
      field: "madeb.sDocumentAttached",
      title: "DOCUMENT ATTACHED",
      width: "6%",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'
      }
    },
    {
      field:"documents",
      title: "DOCUMENTS",
      width:"6%",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'
      },
      filtering: false,
      sorting: false,
      export: false,
      render: rowData => <Button size={"small"} className="m-2 btn-transparent btn-link btn-link-first" onClick={(e) => handleDocumentView(rowData['madeb']['id'])} style={{marginLeft:'15%'}} ><span>View</span></Button> 
    },

    {
      field: "sMadebStatus",
      width: "8%",
      title: "STATUS",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'
      }
    },

    {
      width: "8%",
      field: "madeb.nCurrentGBSno",
      title: "BOOK SERIAL NO.",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'
      }
    },
    {
      field: "madeb.sGBID",
      title: "GB ID",
      width: "8%",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "center",
        padding: '5px'
      }
    },

    {
      field: "madeb.dtFormattedIssueAction",

      width: "8%",
      title: "ISSUE ACTION DATE",
      //   render: rowData => rowData['madeb']['dtIssueAction'] ? Moment(rowData['madeb']['dtIssueAction']).format(sDateFormat) : '',
      // render: rowData => Moment(rowData['madeb']['dtIssueAction']).format('YYYY-MM-DD'),
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'
      },
      customSort: (a, b) => {

        if (!a.madeb.dtFormattedIssueAction) {
          return -1;
        }
        if (!b.madeb.dtFormattedIssueAction) {
          return 1;
        }
        a = a ? a.madeb.dtFormattedIssueAction.split('-').reverse().join('') : '';
        b = b ? b.madeb.dtFormattedIssueAction.split('-').reverse().join('') : '';
        return a.localeCompare(b);
      },
    },
    {
      field: "sTypeIssued",
      width: "8%",
      title: "ISSUE ACTION",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'
      }
    },
    {
      field: "madeb.dtFormattedReturnEmail",
      width: "8%",
      title: "RETURN DATE",
      //render: rowData => Moment(rowData['madeb']['dtReturnEmail']).format('YYYY-MM-DD'),
      //   render: rowData => rowData['madeb']['dtReturnEmail'] ? Moment(rowData['madeb']['dtReturnEmail']).format(sDateFormat) : '',
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'
      },
      customSort: (a, b) => {
        //console.log(a, b);
        if (!a.madeb.dtFormattedReturnEmail) {
          return -1;
        }
        if (!b.madeb.dtFormattedReturnEmail) {
          return 1;
        }
        a = a.madeb.dtFormattedReturnEmail.split('-').reverse().join('');
        b = b.madeb.dtFormattedReturnEmail.split('-').reverse().join('');
        return a.localeCompare(b);
      },
    },
    {
      field: "madeb.dtFormattedReject",
      title: "REJECT DATE",
      width: "8%",
      // render: rowData => rowData['madeb']['dtReject'] ? Moment(rowData['madeb']['dtReject']).format(sDateFormat) : '',
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'
      },
      customSort: (a, b) => {
        //console.log(a, b);
        if (!a.madeb.dtFormattedReject) {
          return -1;
        }
        if (!b.madeb.dtFormattedReject) {
          return 1;
        }
        a = a.madeb.dtFormattedReject.split('-').reverse().join('');
        b = b.madeb.dtFormattedReject.split('-').reverse().join('');
        return a.localeCompare(b);
      },
    },

    {
      field: "madeb.dtFormattedEmailSend",
      title: "EMAIL SENT",
      width: "8%",
      // render: rowData => rowData['madeb']['dtReject'] ? Moment(rowData['madeb']['dtReject']).format(sDateFormat) : '',
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "right",
        padding: '5px'
      },
      customSort: (a, b) => {
        //console.log(a, b);
        if (!a.madeb.dtFormattedEmailSend) {
          return -1;
        }
        if (!b.madeb.dtFormattedEmailSend) {
          return 1;
        }
        a = a.madeb.dtFormattedEmailSend.split('-').reverse().join('');
        b = b.madeb.dtFormattedEmailSend.split('-').reverse().join('');
        return a.localeCompare(b);
      },
    },

    {
      field: "email",
      title: "EMAIL",
      width: "3%",
      filtering: false,
      sorting: false,
      export: false,
      render: rowData => <IconButton color="primary" aria-label="upload picture" component="span"
        onClick={() => { emailClick(rowData) }} style={{ padding: '0px' }}
      >
        <EmailIcon />
      </IconButton>,
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "center",
        padding: '5px'
      }
    },
    {
      field: "edit",
      width: "3%",
      title: "EDIT",
      sorting: false,
      export: false,
      filtering: false,
      render: rowData => <><IconButton color="primary" aria-label="upload picture" component="span"
        onClick={() => { editClick(rowData) }} style={{ padding: '0px' }}
      >
        <EditOutlinedIcon />
      </IconButton>

      </>,
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "center",
        padding: '5px'
      }
    },
    {
      field: "madeb.sMadebStatusRemark",
      width: "8%",
      title: "REMARK",
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "left",
        padding: '5px'
      }
    },
    {
      field: 'Verified By',
      title: 'Verified By',
      sorting: false,
      export: true,
      filtering: false,
      hidden: true,
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "center",
        padding: '5px'
      }
    },
    {
      field: 'Re-Verified By',
      title: 'Re-Verified By',
      sorting: false,
      export: true,
      filtering: false,
      hidden: true,
      headerStyle: {
        textAlign: "center",
        textAlignLast: "center",
        verticalAlign: "middle"
      },
      cellStyle: {
        border: '1px solid black',
        textAlign: "center",
        padding: '5px'
      }
    }

  ];
  const emailClick = (tableRowArray) => {
    // setId(tableRowArray['madeb']['id']);
    // setFormNumber(tableRowArray['madeb']['nFormNumber']);
    // setName(tableRowArray['madeb']['sName']);
    setEmailInObj({
      id: tableRowArray['madeb']['id'],
      nFormNumber: tableRowArray['madeb']['nFormNumber'],
      sName: tableRowArray['madeb']['sName'],
      madebName: 'Sarso',
      nMadebTypeId: 1
    });

    setEmailModal(true);
  }
  const editClick = (tableRowArray) => {

    setId(tableRowArray['madeb']['id']);
    // setFormNumber(tableRowArray['madeb']['nFormNumber']);
    // setAuthority(tableRowArray['sAuthRegion']);
    // setReceivedDate(tableRowArray['madeb']['dtReceived']);
    // setName(tableRowArray['madeb']['sName']);
    // setFname(tableRowArray['madeb']['sFathersName']);
    // setSaney(tableRowArray['madeb']['nSaneyFormNo']);
    // setDocument(tableRowArray['madeb']['sDocumentAttached']);
    // setIssueActionDate(tableRowArray['madeb']['dtIssueAction']);
    // setIssueAction(tableRowArray['madeb']['nIssuedOrNotID']);
    // setReturnDate(tableRowArray['madeb']['dtReturnEmail']);
    // setRejectDate(tableRowArray['madeb']['dtReject']);

    setSarsoObj({
      id: tableRowArray['madeb']['id'],
      nFormNumber: tableRowArray['madeb']['nFormNumber'],
      dtReceived: tableRowArray['madeb']['dtReceived'],
      nAuthRegionID: tableRowArray['madeb']['nAuthRegionID'],
      sName: tableRowArray['madeb']['sName'],
      sGBID: tableRowArray['madeb']['sGBID'],
      sFathersName: tableRowArray['madeb']['sFathersName'],
      nSaneyFormNo: tableRowArray['madeb']['nSaneyFormNo'],
      sDocumentAttached: tableRowArray['madeb']['sDocumentAttached'],
      dtIssueAction: tableRowArray['madeb']['dtIssueAction'],
      nIssuedOrNotID: tableRowArray['madeb']['nIssuedOrNotID'],
      dtReturnEmail: tableRowArray['madeb']['dtReturnEmail'],
      dtReject: tableRowArray['madeb']['dtReject'],
      dtEmailSend: tableRowArray['madeb']['dtEmailSend'],
      nMadebStatusID: tableRowArray['madeb']['nMadebStatusID'],
      nCurrentGBSno: tableRowArray['madeb']['nCurrentGBSno'],
      sMadebStatusRemark: tableRowArray['madeb']['sMadebStatusRemark']
    });

    console.log(sarsoObj);
    setEditModal(true);
  }
  const editAPICall = (madeb) => {
    // let CountryID = countryPK;
    // let countryToUpdate = {
    //   ID : countryPK,
    //   sCountryID: countryID,
    //   sCountry: countryName,
    // };
    console.log(madeb);
    setBackdrop(true);

    axios.post(`/Madeb/EditMadeb/ID=` + id, madeb/*countryToUpdate*/)
      .then(resp => {
        if (resp.status === 200) {
          //console.log(resp.data);
          //alert("Edited record");
          setEditModal(false);
          setAlertMessage('Record Successfully Edited');
          setAlertType('success');
          snackbarOpen();


          // axios.get(`MadebAuthRegionVM/GetMadebsByType/MadebType=1`)
          //   .then(resp => {
          //     if (resp.status === 200) {
          //       resp.data.forEach((element) => {
          //         element.madeb.dtFormattedReceived = element.madeb.dtReceived ? Moment(element.madeb.dtReceived).format(sDateFormat) : null;
          //         element.madeb.dtFormattedIssueAction = element.madeb.dtIssueAction ? Moment(element.madeb.dtIssueAction).format(sDateFormat) : null;
          //         element.madeb.dtFormattedReturnEmail = element.madeb.dtReturnEmail ? Moment(element.madeb.dtReturnEmail).format(sDateFormat) : null;
          //         element.madeb.dtFormattedReject = element.madeb.dtReject ? Moment(element.madeb.dtReject).format(sDateFormat) : null;
          //         element.madeb.dtFormattedEmailSend = element.madeb.dtEmailSend ? Moment(element.madeb.dtEmailSend).format(sDateFormat) : null;

          //       })
          //       setdataAPI(resp.data);

          //       selectDatafunction();
          //     }
          //   })
          //   .catch(error => {
          //     setBackdrop(false);
          //     if (error.response) {
          //       console.error(error.response.data);
          //       console.error(error.response.status);
          //       console.error(error.response.headers);
          //     } else if (error.request) {
          //       console.warn(error.request);
          //     } else {
          //       console.error('Error', error.message);
          //     }
          //     console.log(error.config);
          //   })
          //   .then(release => {
          //     //console.log(release); => udefined
          //   });
          //loadData();
          selectDatafunction();
          searchFunction(nFormNumber, dtReceived, sAuthRegion, sName, sFathersName);
        }
      })
      .catch(error => {
        setAlertMessage('Error editing record ');
        setAlertType('error');
        snackbarOpen();
        setBackdrop(false);
        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          console.warn(error.request);
        } else {
          console.error('Error', error.message);
        }
        console.log(error.config);
      })
      .then(release => {
        //console.log(release); => udefined
      });
  };

  const selectDatafunction = () => {
    setBackdrop(true);
    axios.get(`Madeb/GetNewEmptyMadeb/?nMadebTypeId=1`)
      .then(resp => {
        if (resp.status === 200) {
          setBackdrop(false);
          setSelectData(resp.data);
          setAuthRegionsList(resp.data.authRegions);
          console.log("SelectData:", resp.data);
        }
      })
      .catch(error => {
        setBackdrop(false);
        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          console.warn(error.request);
        } else {
          console.error('Error', error.message);
        }
        console.log(error.config);
      })
      .then(release => {
        //console.log(release); => udefined
      });
  }

  const addAPICall = (madeb) => {
    setBackdrop(true);
    axios.post(`/Madeb/AddMadeb/`, madeb)
      .then(resp => {
        if (resp.status === 200) {
          setAddModal(false);
          setAlertMessage('Record Successfully Added');
          setAlertType('success');
          snackbarOpen();



          // axios.get(`MadebAuthRegionVM/GetMadebsByType/MadebType=1`)
          //   .then(resp => {
          //     if (resp.status === 200) {
          //       resp.data.forEach((element) => {
          //         element.madeb.dtFormattedReceived = element.madeb.dtReceived ? Moment(element.madeb.dtReceived).format(sDateFormat) : null;
          //         element.madeb.dtFormattedIssueAction = element.madeb.dtIssueAction ? Moment(element.madeb.dtIssueAction).format(sDateFormat) : null;
          //         element.madeb.dtFormattedReturnEmail = element.madeb.dtReturnEmail ? Moment(element.madeb.dtReturnEmail).format(sDateFormat) : null;
          //         element.madeb.dtFormattedReject = element.madeb.dtReject ? Moment(element.madeb.dtReject).format(sDateFormat) : null;
          //         element.madeb.dtFormattedEmailSend = element.madeb.dtEmailSend ? Moment(element.madeb.dtEmailSend).format(sDateFormat) : null;
          //       })
          //       setdataAPI(resp.data);

          //       selectDatafunction();
          //     }
          //   })
          //   .catch(error => {
          //     setBackdrop(false);
          //     setAlertMessage('Error! ' + error.message);
          //     setAlertType('error');
          //     snackbarOpen();
          //     if (error.response) {
          //       console.error(error.response.data);
          //       console.error(error.response.status);
          //       console.error(error.response.headers);
          //     } else if (error.request) {
          //       console.warn(error.request);
          //     } else {
          //       console.error('Error', error.message);
          //     }
          //     console.log(error.config);
          //   })
          //   .then(release => {
          //     //console.log(release); => udefined
          //   });
          //loadData();
          selectDatafunction();
          searchFunction(nFormNumber, dtReceived, sAuthRegion, sName, sFathersName);
          //window.location = window.location;
        }
      })
      .catch(error => {
        setAlertMessage('Error adding record ');
        setAlertType('error');
        snackbarOpen();
        setBackdrop(false);
        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          console.warn(error.request);
        } else {
          console.error('Error', error.message);
        }
        console.log(error.config);
      })
      .then(release => {
        //console.log(release); => udefined
      });
  };

  const handleClose = () => {
    setDeleteModal(false);
  };

  const tableRef = React.useRef();

  const loadData = () => {
    setBackdrop(true);
    let text = tableRef.current.dataManager.searchText;
    axios.get(`/MadebAuthRegionVM/SearchMadebsAlternate?parameter=${text}&madebType=1`)
      .then(resp => {
        if (resp.status === 200) {
          console.log(resp.data);
          // myApiData = resp.data;
          // myApiData = myApiData.map(singleMadeb=>{
          //   ...singleMadeb,
          //   singleMaded.dtReceived
          // });

          resp.data.forEach((element) => {
            element.madeb.dtFormattedReceived = element.madeb.dtReceived ? Moment(element.madeb.dtReceived).format(sDateFormat) : null;
            element.madeb.dtFormattedIssueAction = element.madeb.dtIssueAction ? Moment(element.madeb.dtIssueAction).format(sDateFormat) : null;
            element.madeb.dtFormattedReturnEmail = element.madeb.dtReturnEmail ? Moment(element.madeb.dtReturnEmail).format(sDateFormat) : null;
            element.madeb.dtFormattedReject = element.madeb.dtReject ? Moment(element.madeb.dtReject).format(sDateFormat) : null;
            element.madeb.dtFormattedEmailSend = element.madeb.dtEmailSend ? Moment(element.madeb.dtEmailSend).format(sDateFormat) : null;
          })
          setdataAPI(resp.data);
          setBackdrop(false);
          modifyHeaders();
          selectDatafunction();
        }
      })
      .catch(error => {
        setBackdrop(false);
        setAlertMessage('Error in loading Data');
        setAlertType('error');
        snackbarOpen();
        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          console.warn(error.request);
        } else {
          console.error('Error', error.message);
        }
        console.log(error.config);
      })
      .then(release => {
        //console.log(release); => udefined
      });
  }

  useEffect(() => {
    loadData();
    //searchFunction(null, null, null, null, null);
  }, []);

  // useEffect(() => {
  //   const bar = document.getElementById("searchbar").getElementsByTagName('input');
  //   if(bar){
  //     bar[0].focus();
  //   };
  // }, [dataAPI]);



  const searchFunction = (form, date, region, name, fName) => {
    const searchRequest = {
      nFormNumber: form ? form : null,
      dtReceived: date ? date : null,
      sAuthRegion: region ? region : null,
      sName: name ? name : null,
      sFathersName: fName ? fName : null
    }
    console.log("Search Object", searchRequest);
    //setBackdrop(true);
    searchArray.push(searchRequest);
    console.log("Request length: ", searchArray.length);
    if (searchArray.length === 1) {
      processRequest();
    }
    function processRequest() {
      const searchObj = searchArray[0];
      console.log("Processing: ", searchObj.nFormNumber);
      axios.post(`/MadebAuthRegionVM/ColumnSearchMadeb/madebType=1`, searchObj)
        .then(resp => {
          if (resp.status === 200) {
            console.log("Search result", resp.data);
            resp.data.forEach((element) => {
              element.madeb.dtFormattedReceived = element.madeb.dtReceived ? Moment(element.madeb.dtReceived).format(sDateFormat) : null;
              element.madeb.dtFormattedIssueAction = element.madeb.dtIssueAction ? Moment(element.madeb.dtIssueAction).format(sDateFormat) : null;
              element.madeb.dtFormattedReturnEmail = element.madeb.dtReturnEmail ? Moment(element.madeb.dtReturnEmail).format(sDateFormat) : null;
              element.madeb.dtFormattedReject = element.madeb.dtReject ? Moment(element.madeb.dtReject).format(sDateFormat) : null;
              element.madeb.dtFormattedEmailSend = element.madeb.dtEmailSend ? Moment(element.madeb.dtEmailSend).format(sDateFormat) : null;
            });
            setdataAPI(resp.data);
            modifyHeaders();
            //selectDatafunction();
            setBackdrop(false);
            searchArray.shift();
            console.log("Process done, remaining request: ", searchArray.length);
            if (searchArray.length > 0) {
              processRequest();
            }
          }
          if (resp.status === 204) {
            setBackdrop(false);
            console.log("Got 204, Empty result");
            setdataAPI([]);
            setAlertMessage("No Data Found...");
            setAlertType('info');
            snackbarOpen();
            searchArray.shift();
            console.log("Found No result, remaining request: ", searchArray.length);
            if (searchArray.length > 0) {
              processRequest();
            }
          }
        })
        .catch(error => {
          setBackdrop(false);
          setAlertMessage("Error in searching...");
          setAlertType('error');
          snackbarOpen();
          searchArray.shift();
          console.log("Error while searching, remaining request: ", searchArray.length);
          if (searchArray.length > 0) {
            processRequest();
          }
          

        });
    }
  };

  const limitSearchCalls = useCallback(debounce(function(form, date, region, sname, fname) {
    console.log("Debounce");
    searchFunction(form, date, region, sname, fname);
  }, 500),[]);

  return (
    <>
      {/* Header Section */}
      <header
        className="header-box"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 50px",
          backgroundColor: "#f8f8f8",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link to="/Home">
          <img
            src={projectLogo}
            alt="Greenbook Logo"
            width="100"
            height="100"
            style={{ marginRight: "10px", cursor: "pointer" }}
          />
          </Link>
          <h2 style={{
            margin: 0,
            marginRight: "20px",
            whiteSpace: "nowrap",
            fontSize: "24px",
            overflow: "hidden",
            textOverflow: "ellipsis"
            }}
            >
              GREENBOOK DATABASE
              </h2>

          {/* Madeb Dropdown */}
          <div
            style={{ position: "relative", display: "inline-block", margin: "0 10px" }}
            onMouseEnter={() => handleMouseEnter("madeb")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("madeb")}
              style={{
                fontSize: "16px",
                textDecoration: "none",
                color: "#007bff",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "10px 15px",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Madebs
            </button>
            {openDropdown === "madeb" && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "250px", // Fixed width for consistency
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #ddd",
                  padding: "10px",
                  zIndex: 1000,
                  borderRadius: "4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)", // Two columns
                  columnGap: "15px", // Space between columns
                  rowGap: "10px", // Space between rows
                }}
              >
                {["Sarso", "Norchoe", "Bhorlak", "Brief GB", "Book Full", "Abroad"].map(
                  (item, index) => (
                    <Link
                      key={item}
                      to={
                        item === "Sarso"
                        ? "/Sarso"
                        : `/madeb/${item.replace(" ", "-")}`} // Replace space with dash for URL
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        textDecoration: "none",
                        color: "#007bff",
                        borderRadius: "4px",
                        transition: "background-color 0.3s ease",
                        whiteSpace: "nowrap", // Prevent wrapping
                        borderRight: index % 2 === 0 ? "1px solid #ddd" : "none", // Add border between columns
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {item}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* Greenbook Dropdown */}
<div
  style={{ position: "relative", display: "inline-block", margin: "0 10px" }}
  onMouseEnter={() => handleMouseEnter("greenbook")}
  onMouseLeave={handleMouseLeave}
>
  <button
    onClick={() => toggleDropdown("greenbook")}
    style={{
      fontSize: "16px",
      textDecoration: "none",
      color: "#007bff",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "10px 15px",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  >
    Greenbook
  </button>
  {openDropdown === "greenbook" && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "300px", // Increased width for long items
        backgroundColor: "#f8f8f8",
        border: "1px solid #ddd",
        padding: "10px",
        zIndex: 1000,
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)", // Two columns
        columnGap: "15px",
        rowGap: "10px",
      }}
    >
      {[
        "Search",
        "Give GB ID",
        "New Entry",
        "Book Serial Numbers",
        "Print",
        "Edit GB",
        "Make List",
        "Issue Book",
        "Delete",
      ].map((item, index) => (
        <Link
          key={item}
          to={`/greenbook/${item.replace(" ", "-")}`}
          style={{
            display: "block",
            padding: "12px 16px",
            textDecoration: "none",
            color: "#007bff",
            borderRadius: "4px",
            whiteSpace: "normal", // Handle long text
            overflowWrap: "break-word",
            transition: "background-color 0.3s ease",
            borderRight: index % 2 === 0 ? "1px solid #ddd" : "none", // Line between columns
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {item}
        </Link>
      ))}
    </div>
  )}
</div>

{/* Reports Dropdown */}
<div
  style={{ position: "relative", display: "inline-block", margin: "0 10px" }}
  onMouseEnter={() => handleMouseEnter("reports")}
  onMouseLeave={handleMouseLeave}
>
  <button
    onClick={() => toggleDropdown("reports")}
    style={{
      fontSize: "16px",
      textDecoration: "none",
      color: "#007bff",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "10px 15px",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  >
    Reports
  </button>
  {openDropdown === "reports" && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "300px",
        backgroundColor: "#f8f8f8",
        border: "1px solid #ddd",
        padding: "10px",
        zIndex: 1000,
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        columnGap: "15px",
        rowGap: "10px",
      }}
    >
      {[
        "Age-Wise Report",
        "Deceased Report",
      ].map((item, index) => (
        <Link
          key={item}
          to={`/report/${item.replace(" ", "-")}`}
          style={{
            display: "block",
            padding: "12px 16px",
            textDecoration: "none",
            color: "#007bff",
            borderRadius: "4px",
            whiteSpace: "normal",
            overflowWrap: "break-word",
            transition: "background-color 0.3s ease",
            borderRight: index % 2 === 0 ? "1px solid #ddd" : "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {item}
        </Link>
      ))}
    </div>
  )}
</div>

{/* Users Dropdown */}
<div
  style={{ position: "relative", display: "inline-block", margin: "0 10px" }}
  onMouseEnter={() => handleMouseEnter("users")}
  onMouseLeave={handleMouseLeave}
>
  <button
    onClick={() => toggleDropdown("users")}
    style={{
      fontSize: "16px",
      textDecoration: "none",
      color: "#007bff",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "10px 15px",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  >
    Users
  </button>
  {openDropdown === "users" && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "300px",
        backgroundColor: "#f8f8f8",
        border: "1px solid #ddd",
        padding: "10px",
        zIndex: 1000,
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        columnGap: "15px",
        rowGap: "10px",
      }}
    >
      {[
        "Manage Users",
        "Manage Feature Rights",
        "Manage Roles",
      ].map((item, index) => (
        <Link
          key={item}
          to={`/user/${item.replace(" ", "-")}`}
          style={{
            display: "block",
            padding: "12px 16px",
            textDecoration: "none",
            color: "#007bff",
            borderRadius: "4px",
            whiteSpace: "normal",
            overflowWrap: "break-word",
            transition: "background-color 0.3s ease",
            borderRight: index % 2 === 0 ? "1px solid #ddd" : "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {item}
        </Link>
      ))}
    </div>
  )}
</div>

{/* Chatrel Dropdown */}
<div
  style={{ position: "relative", display: "inline-block", margin: "0 10px" }}
  onMouseEnter={() => handleMouseEnter("chatrel")}
  onMouseLeave={handleMouseLeave}
>
  <button
    onClick={() => toggleDropdown("chatrel")}
    style={{
      fontSize: "16px",
      textDecoration: "none",
      color: "#007bff",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "10px 15px",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
  >
    Chatrel
  </button>
  {openDropdown === "chatrel" && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "300px",
        backgroundColor: "#f8f8f8",
        border: "1px solid #ddd",
        padding: "10px",
        zIndex: 1000,
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        columnGap: "15px",
        rowGap: "10px",
      }}
    >
      {[
        "Chatrel List",
        "Chatrel List With Search",
        "Search Users",
        "Bulk Import",
        "Chatrel Report",
        "Chatrel Defaulter Report",
        "Chatrel Summary Report",
      ].map((item, index) => (
        <Link
          key={item}
          to={`/chatrel/${item.replace(" ", "-")}`}
          style={{
            display: "block",
            padding: "12px 16px",
            textDecoration: "none",
            color: "#007bff",
            borderRadius: "4px",
            whiteSpace: "normal",
            overflowWrap: "break-word",
            transition: "background-color 0.3s ease",
            borderRight: index % 2 === 0 ? "1px solid #ddd" : "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f1ff")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {item}
        </Link>
      ))}
    </div>
  )}
</div>
          <button
            onClick={handleLogout}
            style={{
              fontSize: "16px",
              textDecoration: "none",
              color: "#007bff",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: "200px", // Space between button and logo
            }}
          >
            Logout
          </button>
          <Paper>
        <Grid container spacing={1} alignContent='flex-start' style={{ paddingLeft: '2%', maxWidth: '1100px' }} >



          <Grid item xs={1} lg={1}>
          </Grid>
          <Grid item xs={2} lg={2} style={{ paddingTop: '9px', maxWidth:'9%' }}>
            <TextField fullWidth label={'Form No'} onChange={(e) => {
              if (e.target.value) {
                setFormNumber(parseInt(e.target.value));
                //searchFunction(parseInt(e.target.value), dtReceived, sAuthRegion, sName, sFathersName);
                limitSearchCalls(parseInt(e.target.value), dtReceived, sAuthRegion, sName, sFathersName);
              }
              if (e.target.value === '') {
                setFormNumber(null);
                searchFunction(null, dtReceived, sAuthRegion, sName, sFathersName);
              }

            }

            } />
          </Grid>
          <Grid item xs={2} lg={2} style={{ paddingTop: '9px', maxWidth: '14%' }}>
            <TextField
              fullWidth
              label={'Full Name'}
              onChange={(e) => {
                if (e.target.value) {
                  setName(e.target.value);
                  //searchFunction(nFormNumber, dtReceived, sAuthRegion, e.target.value, sFathersName);
                  limitSearchCalls(nFormNumber, dtReceived, sAuthRegion, e.target.value, sFathersName);
                }
                if (e.target.value === '') {
                  setName(null);
                  searchFunction(nFormNumber, dtReceived, sAuthRegion, null, sFathersName);
                }
              }}
            />
          </Grid>
          <Grid item xs={2} lg={2} style={{ paddingTop: '9px' }}>
            <Autocomplete
              openOnFocus
              clearOnEscape
              autoComplete={true}
              autoHighlight={true}
              fullWidth
              onChange={
                (e, value) => {
                  if (value !== null) {
                    setAuthRegion(value.sAuthRegion);
                    //searchFunction(nFormNumber, dtReceived, value.sAuthRegion, sName, sFathersName);
                    limitSearchCalls(nFormNumber, dtReceived, value.sAuthRegion, sName, sFathersName);
                  }
                  else {
                    setAuthRegion(null);
                    searchFunction(nFormNumber, dtReceived, null, sName, sFathersName);
                  }
                }
              }
              style={{ width: '180px', paddingRight: '10px' }}
              //value={valueAuthRegion}
              id="id_nAuthorityId"
              options={authRegions}
              getOptionLabel={(option) => option.sAuthRegion}
              renderOption={(option) => (
                <React.Fragment>
                  <span>{option.sAuthRegion}</span>
                </React.Fragment>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Authority Region"
                  variant="standard"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'off', // disable autocomplete and autofill
                  }}
                />
              )}
            />
            {/* <TextField
              label={'Authority '}
              onChange={(e) => {
                setAuthRegion(e.target.value);
                searchFunction(nFormNumber, dtReceived, e.target.value, sName, sFathersName);
              }}
            /> */}
          </Grid>


          <Grid item xs={2} lg={2} style={{ paddingTop: '9px', maxWidth: '13%', paddingLeft: '15px' }}>
            <TextField
              label={"Father's Name"}
              fullWidth
              onChange={(e) => {
                if (e.target.value) {
                  setFathersName(e.target.value);
                  //searchFunction(nFormNumber, dtReceived, sAuthRegion, sName, e.target.value);
                  limitSearchCalls(nFormNumber, dtReceived, sAuthRegion, sName, e.target.value);
                }

                if (e.target.value === '') {
                  setFathersName(null);
                  searchFunction(nFormNumber, dtReceived, sAuthRegion, sName, null);
                }
              }}
            />
          </Grid>
          <Grid item xs={2} lg={2} style={{ minWidth: '14%'}}>

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                placeholder="DD-MM-YYYY"
                variant="dialog"
                margin="dense"
                id="dtReceived"
                name="dtReceived"
                autoOk
                fullWidth
                label='Received Date'
                format={sDateFormatMUIDatepicker}
                returnMoment={true}
                onChange={(date) => {
                  console.log("Date object", date);
                  if (Moment(date, true).isValid()) {
                    console.log("Valid Date", date);
                    setReceivedDate(Moment(date, true).format(sISODateFormat));
                    //searchFunction(nFormNumber, Moment(date, true).format(sISODateFormat), sAuthRegion, sName, sFathersName);
                    limitSearchCalls(nFormNumber, Moment(date, true).format(sISODateFormat), sAuthRegion, sName, sFathersName);
                  }
                  if (date === null) {
                    console.log("Empty Date", date);
                    setReceivedDate(null);
                    searchFunction(nFormNumber, null, sAuthRegion, sName, sFathersName);
                  }
                  // if (date) {
                  //   setStartDate(date);
                  //   setValue('startDate', date, { shouldValidate: true });
                  // };
                }}
                value={dtReceived}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}

              // fullWidth
              //className={classes.dateField}
              // inputRef={register({
              //   required: true,
              //   pattern:
              //   {
              //     value: new RegExp(sDDMMYYYYRegex),
              //     message: "Invalid Date"
              //   }
              // })}
              />
            </MuiPickersUtilsProvider>


            {/* <TextField
                label={'Received Date'}
                onChange={(e) => {
                  if (Moment(e.target.value, 'DD-MM-YYYY', true).isValid()) {
                    console.log("Valid Date", e.target.value);
                    setReceivedDate(Moment(e.target.value, 'DD-MM-YYYY', true).format(sISODateFormat));
                    searchFunction(nFormNumber, Moment(e.target.value, 'DD-MM-YYYY', true).format(sISODateFormat), sAuthRegion, sName, sFathersName);
                  }
                  if (e.target.value === '') {
                    searchFunction(nFormNumber, null, sAuthRegion, sName, sFathersName);
                  }
  
                }}
              /> */}
          </Grid>
          <Grid item xs={1} lg={1}>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <MaterialTable style={{ padding: '10px', width: '100%', border: '0px', boxShadow: 'none', fontSize: '1rem', color: '#000000', fontWeight: 'bold' }}
              //isLoading={isLoading}
              tableRef={tableRef}
              icons={oTableIcons}
              title='Sarso Madeb'
              columns={columns}
              data={dataAPI}
              options={{
                ...oOptions,
                exportFileName: 'Sarso Madeb',
                search: false
              }}
              // components={{
              //   Toolbar: props => (<div id='searchbar'><MTableToolbar
              //               {...props}
              //               onSearchChanged={searchText => {
              //               console.log(searchText);
              //               axios.get(`/MadebAuthRegionVM/SearchMadebsAlternate?parameter=${searchText}&madebType=1`)
              //               .then(resp => {
              //                 setBackdrop(false);
              //                 if(resp.status === 200){
              //                   console.log("Search result", resp.data);
              //                   resp.data.forEach((element) => {
              //                     element.madeb.dtFormattedReceived = element.madeb.dtReceived ? Moment(element.madeb.dtReceived).format(sDateFormat) : null;
              //                     element.madeb.dtFormattedIssueAction = element.madeb.dtIssueAction ? Moment(element.madeb.dtIssueAction).format(sDateFormat) : null;
              //                     element.madeb.dtFormattedReturnEmail = element.madeb.dtReturnEmail ? Moment(element.madeb.dtReturnEmail).format(sDateFormat) : null;
              //                     element.madeb.dtFormattedReject = element.madeb.dtReject ? Moment(element.madeb.dtReject).format(sDateFormat) : null;
              //                     element.madeb.dtFormattedEmailSend = element.madeb.dtEmailSend ? Moment(element.madeb.dtEmailSend).format(sDateFormat) : null;
              //                   });
              //                   setdataAPI(resp.data);
              //                 }
              //                 if(resp.status === 204){
              //                   console.log("Got 204, Empty result");
              //                   setdataAPI([]);
              //                 }
              //               })
              //               .catch(error =>{
              //                 setBackdrop(false);
              //                 setAlertMessage("Error in searching...");
              //                 setAlertType('error');
              //                 snackbarOpen();
              //               });
              //               //commonSearch(searchText);
              //               //props.onSearchChanged(searchText);
              //               }}
              //           /></div>)
              // }}
              // components={
              //   {Toolbar: props => (<div id='searchbar'><MTableToolbar {...props}/> 
              //         <Grid container style={{maxWidth: '1000px'}} spacing={1}>
              //         <Grid item xs={2} lg={2}><TextField label={'Form Number'} onChange = {(e) =>{ console.log(e.target.value); searchFunction(e.target.value, 'F');
              //         }

              //         }/></Grid> 

              //         <Grid item xs={2} lg={2}><TextField label={'Received Date'} /></Grid>
              //         <Grid item xs={3} lg={3}><TextField label={'Authority '} /></Grid>

              //         <Grid item xs={3} lg={3}><TextField label={'Name'} /></Grid>
              //         <Grid item xs={2} lg={2}><TextField label={"Father's Name"} /></Grid>
              //       </Grid>


              //               </div>)
              //   }
              // }

              actions={[
                {
                  icon: oTableIcons.Add,
                  tooltip: 'Add Sarso Madeb',
                  isFreeAction: true,
                  onClick: () => setAddModal(true)
                },
                {
                  icon: oTableIcons.Search,
                  tooltip: 'Toggle Filter',
                  isFreeAction: true,
                  onClick: (event) => { setFiltering(currentFilter => !currentFilter) }
                }
              ]}
            />
            {addModal && <AddDialog
              addModal={addModal}
              classes={classes}
              selectData={selectData}
              handleAddClickClose={handleAddClickClose}
              addAPICall={addAPICall}
            />}
            {editModal && <EditDialog
              editModal={editModal}
              sarsoObj={sarsoObj}
              selectData={selectData}
              classes={classes}
              handleEditClickClose={handleEditClickClose}
              editAPICall={editAPICall}
            />}
            {emailModal && <EmailDialog
              emailModal={emailModal}
              emailInObj={emailInObj}
              //selectData={selectData}
              classes={classes}
              handleEmailClickClose={handleEmailClickClose}
            //emailAPICall={emailAPICall}
            />}
            {viewDocs && <ViewDocuments
              viewDocs={viewDocs}
              handleDocumentsClose={handleDocumentsClose}
              madebId={madebId}
              setAlertMessage={setAlertMessage}
              setAlertType={setAlertType}
              snackbarOpen={snackbarOpen}
            />}
            {snackbar && <Alerts
              alertObj={alertObj}
              snackbar={snackbar}
              snackbarClose={snackbarClose}
            />}
            {backdrop && <BackdropComponent
              backdrop={backdrop}
            />}
          </Grid>

        </Grid>
      </Paper>
        </div>
      </header>
    </>
  );
}
