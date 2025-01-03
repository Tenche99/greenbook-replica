import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import projectLogo from "../assets/Images/CTALogo.png";

const searchArray = [];

const Norchoe = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [AuthRegion, setAuthRegions] = useState([]);
  const [sAuthRegion, setSelectedAuthRegion] = useState(null);
  const [nFormNumber, setFormNumber] = useState("");
  const [nsearchFormNumber, setSearchFormNumber] = useState("");
  const [sName, setFullName] = useState("");
  const [sFathersName, setFatherName] = useState("");
  const [dtReceived, setReceivedDate] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [saneyFormNo, setSaneyFormNo] = useState("");
  const [documentAttached, setDocumentAttached] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [madebStatus, setMadebStatus] = useState("");

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/Sarso/AddSarsoMadeb");
  };

  const madebStatusMapping = [
    { id: 1, label: "In Progress" },
    { id: 2, label: "Approved" },
    { id: 3, label: "Rejected" },
    { id: 4, label: "Double" },
    { id: 5, label: "Cancelled" },
  ];
  const handleEditOpen = (row) => {
    const selectedRegion = AuthRegion.find(
      (region) => region.sAuthRegion === row.sAuthRegion
    );

    setEditRow({
      ...row,
      sAuthRegion: selectedRegion || null,
      madeb: {
        ...row.madeb,
        nMadebStatusID: row.madeb.nMadebStatusID, // Ensure this is set correctly
      },
    });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditRow(null);
  };
  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved from localStorage:", token);

      if (!token) {
        alert("No token found. Please log in again.");
        return; // Stop execution if no token
      }

      const payload = {
        ...editRow.madeb,
        nAuthRegionID: editRow.sAuthRegion?.id || null,
        nMadebStatusID: editRow.madeb.nMadebStatusID,
      };
      //console.log("Payload sent to EditMadeb API:", payload);

      const response = await axios.post(
        `http://localhost/api/Madeb/EditMadeb/ID=${editRow.madeb.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Edit API response:", response.data);
      alert("Record updated successfully");
      //fetchData(); // Refresh the table data
      handleEditClose();
    } catch (error) {
      console.error("Error updating record:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in again.");
        return;
      }

      console.log("Token:", token);

      const response = await fetch("http://localhost/api/User/Logout/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");

        navigate("/login");
      } else if (response.status === 401) {
        console.error("Unauthorized: Invalid or expired token");

        navigate("/login");
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

  //   const fetchData = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const response = await axios.get(
  //         "http://localhost/api/MadebAuthRegionVM/GetMadebsByType/MadebType%3D1",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       setData(response.data);
  //     } catch (error) {
  //       if (error.response && error.response.status === 401) {
  //         console.error("Unauthorized - Invalid or expired token");
  //       }
  //       setError(error.message || "Error fetching data");
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  useEffect(() => {
    //fetchData();
  }, []);

  useEffect(() => {
    const fetchAuthRegions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost/api/Madeb/GetNewEmptyMadeb/?nMadebTypeId=1",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data.authRegions)) {
          setAuthRegions(response.data.authRegions);
          setSearchFormNumber(response.data.nFormNumber);
        } else {
          console.error("Unexpected API response structure", response.data);
          setAuthRegions([]);
        }
      } catch (error) {
        console.error("Error fetching authority regions:", error);
        setAuthRegions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthRegions();
  }, []);

  const handleSearch = () => {
    const searchRequest = {
      nFormNumber: nFormNumber ? nFormNumber : null,
      dtReceived: dtReceived ? dtReceived : null,
      sAuthRegion: sAuthRegion ? sAuthRegion.sAuthRegion : null,
      sName: sName ? sName : null,
      sFathersName: sFathersName ? sFathersName : null,
    };

    console.log("Search Request:", searchRequest);
    searchArray.push(searchRequest);
    console.log("Request length: ", searchArray.length);
    if (searchArray.length === 1) {
      processRequest();
    }

    function processRequest() {
      const currentRequest = searchArray[0]; // Get the first request to process
      console.log("Processing request:", currentRequest);

      const token = localStorage.getItem("token");

      // Make an axios POST request
      axios
        .post(
          "http://localhost/api/MadebAuthRegionVM/ColumnSearchMadeb/madebType=1",
          currentRequest,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log("Response from server:", response.data);
          if (Array.isArray(response.data)) {
            setData(response.data); // Only set data if it's an array
          } else {
            setData([]); // Fallback to empty array if data is not an array
          }
        })
        .catch((error) => {
          console.error("Error making POST request:", error);
          setData([]); // Set to an empty array on error to prevent breaking the UI
        })
        .finally(() => {
          searchArray.shift(); // Remove the processed request
        });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
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
      nsearchFormNumber: nsearchFormNumber || null,
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
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Madeb added successfully 💥");
      console.log("Madeb added successfully", response.data);

      // Close the form after saving
      setOpen(false);

      // Reset the form fields (optional)
      setSearchFormNumber("");
      setReceivedDate("");
      setSelectedAuthRegion("");
      setFullName("");
      setFatherName("");
      setStatusRemarks("");
      setSaneyFormNo("");
      setDocumentAttached(false);

      // Refresh the table data to reflect the new entry
      //fetchData();
    } catch (error) {
      console.error(
        "Error adding Madeb:",
        error.response?.data || error.message
      );
    }
  };

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
              style={{ marginRight: "15px", cursor: "pointer" }}
            />
          </Link>
          <h2
            style={{
              margin: 0,
              marginRight: "20px",
              whiteSpace: "nowrap",
              fontSize: "24px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            GREENBOOK DATABASE
          </h2>

          {/* Madeb dropdown */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              margin: "0 10px",
            }}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e7f1ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
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
                {[
                  "Sarso",
                  "Norchoe",
                  "Bhorlak",
                  "Brief GB",
                  "Book Full",
                  "Abroad",
                ].map((item, index) => (
                  <Link
                    key={item}
                    to={
                      item === "Sarso"
                        ? "/Sarso"
                        : `/madeb/${item.replace(" ", "-")}`
                    }
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e7f1ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Green Book Dropdown */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              margin: "0 10px",
            }}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e7f1ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e7f1ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reports Dropdown */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              margin: "0 10px",
            }}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e7f1ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
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
                {["Age-Wise Report", "Deceased Report"].map((item, index) => (
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e7f1ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Users Dropdown */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              margin: "0 10px",
            }}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e7f1ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
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
                {["Manage Users", "Manage Feature Rights", "Manage Roles"].map(
                  (item, index) => (
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
                        borderRight:
                          index % 2 === 0 ? "1px solid #ddd" : "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#e7f1ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {item}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* Chatrel Dropdown */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              margin: "0 10px",
            }}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e7f1ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e7f1ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
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
        </div>
      </header>
      {/* ------------------------------------------------------>     */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row", // Change to row for single-line layout
            gap: 2,
            alignItems: "center", // Align items to center vertically
            flexWrap: "wrap", // Wrap if screen size is small
          }}
        >
          <TextField
            label="Form No"
            variant="standard"
            value={nFormNumber}
            onChange={(e) => setFormNumber(e.target.value)}
            onKeyDown={handleKeyDown} // Attach keydown handler
            sx={{ width: "200px" }} // Adjust width as needed
          />
          <TextField
            label="Full Name"
            variant="standard"
            value={sName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={handleKeyDown} // Attach keydown handler
            sx={{ width: "200px" }} // Adjust width as needed
          />
          <TextField
            label="Father Name"
            variant="standard"
            value={sFathersName}
            onChange={(e) => setFatherName(e.target.value)}
            onKeyDown={handleKeyDown} // Attach keydown handler
            sx={{ width: "200px" }} // Adjust width as needed
          />
          <TextField
            label="Received Date"
            type="date"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
            value={dtReceived}
            onChange={(e) => setReceivedDate(e.target.value)}
            onKeyDown={handleKeyDown} // Attach keydown handler
            sx={{ width: "200px" }} // Adjust width as needed
          />
          <Autocomplete
            options={AuthRegion}
            getOptionLabel={(option) => option.sAuthRegion || ""}
            value={sAuthRegion}
            onChange={(event, newValue) => setSelectedAuthRegion(newValue)}
            loading={loading}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                label="Authority Region"
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                onKeyDown={handleKeyDown} // Attach keydown handler
                sx={{ width: "200px" }} // Adjust width as needed
              />
            )}
          />
        </Box>
      </Box>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end", // Aligns the buttons to the right
          alignItems: "center",
          gap: "10px", // Space between buttons
          width: "100%", // Ensure the div takes full width of the container
        }}
      >
        <button
          onClick={handleOpen}
          title="Add Sarso Madeb" // Tooltip for the Add button
          style={{
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Center icon in button
          }}
        >
          <AddIcon style={{ fontSize: "24px" }} />{" "}
          {/* Add icon with adjusted size */}
        </button>
      </div>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%", // Make it responsive for smaller screens
            maxWidth: 600, // Restrict the width
            maxHeight: "90vh", // Restrict the height
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            overflowY: "auto", // Add scrolling for overflow content
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
                value={nsearchFormNumber}
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
                {AuthRegion.map((region) => (
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
                select
                label="Madeb Status"
                value={madebStatus}
                onChange={(e) => setMadebStatus(e.target.value)}
                fullWidth
                margin="normal"
              >
                {[
                  "In Progress",
                  "Approved",
                  "Rejected",
                  "Double",
                  "Cancelled",
                ].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>

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
          Norchoe Madeb
        </Typography>

        <TableContainer component={Paper}>
          <Table sx={{ borderCollapse: "collapse", border: "1px solid black" }}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#f0f8ff", // Change this to the desired color
                  color: "white", // White text color for better contrast
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Form Number
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Received Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Authority
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Full Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  GB ID
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Change Field
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Document Attached
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Receipt No
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                    whiteSpace: "normal",
                  }}
                >
                  Current GB SR No
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Previous GB SR No
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Issue Action Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Issue Action
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Return Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Reject Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Email Sent
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Edit
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid black",
                    textAlign: "center",
                  }}
                >
                  Remark
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.madeb.id}>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.madeb.nFormNumber}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.madeb.dtReceived
                      ? moment(row.madeb.dtReceived).format("MM/DD/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.sAuthRegion}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.madeb.sName}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                    >
                        {row.madeb.sGBID}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                    >
                        {row.madeb.sField}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.madeb.sDocumentAttached}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                    >
                        {row.madeb.sDocuments}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                    >
                        {row.madeb.nReceiptNo}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                    >
                        {row.madeb.nCurrentGBSno}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                    >
                        {row.madeb.nPreviousGBSno}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.sMadebStatus}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.madeb.dtIssueAction
                      ? moment(row.madeb.dtIssueAction).format("MM/DD/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.madeb.dtReject
                      ? moment(row.madeb.dtReject).format("MM/DD/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    {row.madeb.dtEmailSend
                      ? moment(row.madeb.dtEmailSend).format("MM/DD/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black", textAlign: "center" }}
                  >
                    <EditIcon
                      onClick={() => handleEditOpen(row)}
                      style={{ cursor: "pointer", color: "blue" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <Modal open={editOpen} onClose={handleEditClose}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "90%", // Adjust for smaller screens
                  maxWidth: 600,
                  maxHeight: "90vh",
                  bgcolor: "background.paper",
                  border: "2px solid #000",
                  boxShadow: 24,
                  p: 4,
                  overflowY: "auto",
                }}
              >
                <h2>Edit Madeb</h2>
                {editRow && (
                  <>
                    <TextField
                      label="Form Number"
                      value={editRow.madeb.nFormNumber}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: {
                            ...editRow.madeb,
                            nFormNumber: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Full Name"
                      value={editRow.madeb.sName}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: { ...editRow.madeb, sName: e.target.value },
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Date Received"
                      value={editRow.madeb.dtReceived}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: {
                            ...editRow.madeb,
                            dtReceived: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <Autocomplete
                      options={AuthRegion}
                      getOptionLabel={(option) => option.sAuthRegion || ""}
                      isOptionEqualToValue={
                        (option, value) => option.id === value.id // Match by ID
                      }
                      value={editRow?.sAuthRegion || null} // Prefill the selected region
                      onChange={(event, newValue) =>
                        setEditRow({ ...editRow, sAuthRegion: newValue })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Authority Region"
                          margin="normal"
                        />
                      )}
                      disableClearable
                    />
                    <TextField
                      select
                      label="Madeb Status"
                      value={editRow?.madeb.nMadebStatusID || ""} // Use the ID directly
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: {
                            ...editRow.madeb,
                            nMadebStatusID: parseInt(e.target.value, 10), // Ensure the ID is an integer
                          },
                        })
                      }
                      fullWidth
                      margin="normal"
                    >
                      {madebStatusMapping.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Father Name"
                      value={editRow.madeb.sFathersName}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: {
                            ...editRow.madeb,
                            sFathersName: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="status remarks"
                      value={editRow.madeb.statusRemarks}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: {
                            ...editRow.madeb,
                            statusRemarks: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Saney Form No"
                      value={editRow.madeb.nSaneyFormNo}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: {
                            ...editRow.madeb,
                            nSaneyFormNo: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Document Attached"
                      value={editRow.madeb.documentAttached}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow,
                          madeb: {
                            ...editRow.madeb,
                            documentAttached: e.target.value,
                          },
                        })
                      }
                      fullWidth
                      margin="normal"
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEditSave}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleEditClose}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Modal>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default Norchoe;
