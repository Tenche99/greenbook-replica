import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, Autocomplete, TextField, Box, Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import projectLogo from "../assets/Images/CTALogo.png";

const searchArray = [];

const Sarso = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [AuthRegion, setAuthRegions] = useState([]);
  const [sAuthRegion, setSelectedAuthRegion] = useState(null);
  const [nFormNumber, setFormNumber] = useState('');
  const [sName, setFullName] = useState('');
  const [sFathersName, setFatherName] = useState('');
  const [dtReceived, setReceivedDate] = useState('');

  const navigate = useNavigate();

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
      const currentRequest = searchArray[0];  // Get the first request to process
    console.log("Processing request:", currentRequest);

    const token = localStorage.getItem("token");

    // Make an axios POST request
    axios.post("http://localhost/api/MadebAuthRegionVM/ColumnSearchMadeb/madebType=1",
      currentRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    )
      .then(response => {
        console.log("Response from server:", response.data);
        setData(response.data);
        // You can handle response data here
      })
      .catch(error => {
        console.error("Error making POST request:", error);
        // Handle any errors here
      })
      .finally(() => {
        // After request is processed, you can clear the array or remove processed requests
        searchArray.shift();  // Remove the processed request
      });
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
        
        {/* Madeb dropdown */}
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
    {[
      "Sarso",
      "Norchoe",
      "Bhorlak",
      "Brief GB",
      "Book Full", // Ensure this is a single entry
      "Abroad",
    ].map((item, index) => (
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
    ))}
  </div>
)}
</div>

{/* Green Book Dropdown */}
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
      </div>
    </header>
    {/* ------------------------------------------------------>     */}
    <Box sx={{ p: 2 }}>
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',  // Change to row for single-line layout
          gap: 2,
          alignItems: 'center', // Align items to center vertically
          flexWrap: 'wrap',     // Wrap if screen size is small
        }}
      >
        <TextField
          label="Form No"
          variant="standard"
          value={nFormNumber}
          onChange={(e) => setFormNumber(e.target.value)}
          onKeyDown={handleKeyDown} // Attach keydown handler
          sx={{ width: '200px' }} // Adjust width as needed
        />
        <TextField
          label="Full Name"
          variant="standard"
          value={sName}
          onChange={(e) => setFullName(e.target.value)}
          onKeyDown={handleKeyDown} // Attach keydown handler
          sx={{ width: '200px' }} // Adjust width as needed
        />
        <TextField
          label="Father Name"
          variant="standard"
          value={sFathersName}
          onChange={(e) => setFatherName(e.target.value)}
          onKeyDown={handleKeyDown} // Attach keydown handler
          sx={{ width: '200px' }} // Adjust width as needed
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
          sx={{ width: '200px' }} // Adjust width as needed
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
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              onKeyDown={handleKeyDown} // Attach keydown handler
              sx={{ width: '200px' }} // Adjust width as needed
            />
          )}
        />
      </Box>
    </Box>
        
    <div>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Sarso Madeb
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Form Number</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Received Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Authority</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Father's Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Saney Form No</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Document Attached</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Book Serial No</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>GB ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Issue Action Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Issue Action</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Return Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Reject Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Email Sent</TableCell>
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

export default Sarso;