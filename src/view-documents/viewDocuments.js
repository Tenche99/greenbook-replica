import { Button, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BackdropComponent } from "../backdrop/index";
import {
  sButtonColor,
  sButtonSize,
  sButtonVariant,
} from "../config/commonConfig";

export default function ViewDocuments(props) {
  console.log("Props in View document:", props);
  //const applicationObj = props.applicationObj; // object - {applicationId, formType}
  const [rows, setRows] = useState([]); // child record rows
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [backdrop, setBackdrop] = useState(false);
  const [message, setMessage] = useState("Loading...");
  const [messageColor, setMessageColor] = useState("blue");

  const columns = [
    { id: "action", label: "Action", minWidth: 100 },
    { id: "name", label: "File\u00a0Name", minWidth: 100 },
    { id: "documentSize", label: "File\u00a0Size", minWidth: 100 },
    { id: "documentType", label: "File\u00a0Type", minWidth: 100 },
  ];

  function fetchDocuments() {
    setBackdrop(true);
    try {
      axios
        .get(`Madeb/GetDocuments?madebId=${props.madebId}`)
        .then((response) => {
          setBackdrop(false);
          if (response.status === 200) {
            setRows(response.data);
            props.setAlertMessage("Data Fetched successfully");
            props.setAlertType("success");
            props.snackbarOpen();
          } else {
            props.setAlertMessage("No documents found");
            props.setAlertType("warning");
            props.snackbarOpen();
            setMessage("[No Data]");
            setMessageColor("red");
          }
        })
        .catch((err) => {
          setBackdrop(false);
          console.log("Error in View docs:", err);
          props.setAlertMessage("Error in fetching documents");
          props.setAlertType("error");
          props.snackbarOpen();
          setMessage("[No Data]");
          setMessageColor("red");
        });
    } catch (error) {}
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function handleDocumentView(viewRow) {
    const blob = base64toBlob(viewRow.base64Data, viewRow.documentMetaData);

    //const blob = base64toBlob(img, 'application/pdf');
    const blobUrl = URL.createObjectURL(blob);
    console.log("blobUrl:", blobUrl);
    window.open(blobUrl);
  }

  const base64toBlob = (base64Data, type) => {
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    // console.log(byteArrays);
    //var maginNumber= byteArrays.join('').toUpperCase();
    //console.log(getTypeFromMagicNumber(maginNumber));

    return new Blob(byteArrays, { type: type });

    //  return new Blob(byteArrays);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);
  return (
    <>
      <Dialog
        maxWidth={"md"}
        fullWidth={true}
        open={props.viewDocs}
        onEscapeKeyDown={props.handleDocumentsClose}
      >
        <DialogTitle id="documentsf-dialog-title">View Documents</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h5">Documents:</Typography>
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              //align={column.align}
                              sx={
                                column.id === "action"
                                  ? {
                                      position: "sticky",
                                      left: 0,
                                      background: "white",
                                      boxShadow: "5px 2px 5px grey",
                                      //borderRight: "2px solid black",
                                      zIndex: 99,
                                    }
                                  : {}
                              }
                              style={{ minWidth: column.minWidth }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.length > 0 &&
                          rows
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                            .map((row) => {
                              return (
                                <TableRow
                                  hover
                                  role="checkbox"
                                  tabIndex={-1}
                                  key={row.documentId}
                                >
                                  {columns.map((column) => {
                                    const value = row[column.id];
                                    return (
                                      <TableCell
                                        key={column.id}
                                        align={column.align}
                                        sx={
                                          column.id === "action"
                                            ? {
                                                position: "sticky",
                                                left: 0,
                                                background: "white",
                                                boxShadow: "5px 2px 5px grey",
                                                //borderRight: "2px solid black",
                                                zIndex: 99,
                                              }
                                            : {}
                                        }
                                      >
                                        {column.id === "action" ? (
                                          <>
                                            <a
                                              href="#"
                                              onClick={(e) =>
                                                handleDocumentView(row)
                                              }
                                              style={{ marginLeft: "15%" }}
                                            >
                                              <strong>View</strong>
                                            </a>
                                          </>
                                        ) : column.format &&
                                          typeof value === "number" ? (
                                          column.format(value)
                                        ) : (
                                          value
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                        {rows && rows.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={columns.length}>
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <span style={{ color: messageColor }}>
                                    {message}
                                  </span>
                                </div>
                              </>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Paper>
              </Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={props.handleDocumentsClose}
            color={sButtonColor}
            variant={sButtonVariant}
            size={sButtonSize}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {backdrop && <BackdropComponent backdrop={backdrop} />}
    </>
  );
}
