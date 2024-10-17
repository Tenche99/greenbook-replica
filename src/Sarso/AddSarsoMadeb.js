import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Modal,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const SarsoForm = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formNumber, setFormNumber] = useState("");
  const [dtReceived, setReceivedDate] = useState("");
  const [sAuthRegion, setSelectedAuthRegion] = useState("");
  const [authRegions, setAuthRegions] = useState([]);
  const [sName, setFullName] = useState("");
  const [sFathersName, setFatherName] = useState("");
  const [madebStatus] = useState("In progress");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [saneyFormNo, setSaneyFormNo] = useState("");
  const [documentAttached, setDocumentAttached] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost/api/MadebAuthRegionVM/GetMadebsByType/MadebType%3D1",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized - Invalid or expired token");
      }
      setError(error.message || "Error fetching data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFormNumberAndRegions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost/api/Madeb/GetNewEmptyMadeb/?nMadebTypeId=1",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFormNumber(response.data.nFormNumber);
        setAuthRegions(response.data.authRegions);
      } catch (error) {
        console.error(
          "Error fetching form number or authority regions:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchFormNumberAndRegions();
    }
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. You need to log in.");
      return;
    }

    const payload = {
      dtReceived: dtReceived || null,
      nAuthRegionID: sAuthRegion ? sAuthRegion.id : null,
      nFormNumber: formNumber || null,
      nMadebStatusID: 1,
      nMadebTypeID: 1,
      sDocumentAttached: documentAttached ? "Yes" : "",
      sFathersName: sFathersName || "",
      sMadebStatusRemark: statusRemarks || "",
      sName: sName || "",
    };

    try {
      const response = await axios.post(
        "http://localhost/api/Madeb/AddMadeb/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Make sure the token is correctly set
          },
        }
      );
      //fetchData();
      console.log("Madeb added successfully", response.data);
    } catch (error) {
      console.error(
        "Error adding Madeb:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <>
      {/* Button to open form, positioned at the top right */}
      <Button
        variant="contained"
        onClick={handleOpen}
        style={{ position: "absolute", top: 20, right: 20 }}
      >
        Add Madeb
      </Button>

      {/* Modal for the form */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            width: 600,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            m: "auto",
            mt: 10,
          }}
        >
          <h2>Add New Madeb</h2>

          {/* Form fields */}
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <TextField
                label="Form Number"
                value={formNumber}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Received Date"
                type="date"
                value={dtReceived}
                onChange={(e) => setReceivedDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                label="Authority Region"
                value={sAuthRegion}
                onChange={(e) => setSelectedAuthRegion(e.target.value)}
                fullWidth
                margin="normal"
              >
                {authRegions.map((region) => (
                  <MenuItem key={region.id} value={region}>
                    {region.sAuthRegion}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Name"
                value={sName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Father's Name"
                value={sFathersName}
                onChange={(e) => setFatherName(e.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Status Remarks"
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Saney Form No"
                value={saneyFormNo}
                onChange={(e) => setSaneyFormNo(e.target.value)}
                fullWidth
                margin="normal"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={documentAttached}
                    onChange={(e) => setDocumentAttached(e.target.checked)}
                  />
                }
                label="Document Attached"
              />

              {/* Buttons */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <div>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          Sarso Madeb
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Form Number</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Received Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Authority</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Father's Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Saney Form No</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Document Attached
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Book Serial No
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>GB ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Issue Action Date
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Issue Action</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Return Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Reject Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email Sent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.madeb.id}>
                  <TableCell>{row.madeb.nFormNumber}</TableCell>
                  <TableCell>{row.madeb.dtReceived}</TableCell>
                  <TableCell>{row.sAuthRegion}</TableCell>
                  <TableCell>{row.madeb.sName}</TableCell>
                  <TableCell>{row.madeb.sFathersName}</TableCell>
                  <TableCell>{row.madeb.nSaneyFormNo}</TableCell>
                  <TableCell>{row.madeb.sDocumentAttached}</TableCell>
                  <TableCell>{row.sMadebStatus}</TableCell>
                  <TableCell>{row.madeb.nCurrentGBSno}</TableCell>
                  <TableCell>{row.madeb.sGBID}</TableCell>
                  <TableCell>{row.madeb.dtIssueAction}</TableCell>
                  <TableCell>{row.sTypeIssued}</TableCell>
                  <TableCell>{row.madeb.dtReturnEmail}</TableCell>
                  <TableCell>{row.madeb.dtReject}</TableCell>
                  <TableCell>{row.madeb.dtEmailSend}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default SarsoForm;
