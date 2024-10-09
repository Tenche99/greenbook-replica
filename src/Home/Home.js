import { Card } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { Link } from "react-router-dom";
import projectLogo from "../assets/Images/CTALogo.png";

export default function Home() {
  const [openDropdown, setOpenDropdown] = useState(null); // State to track the open dropdown
  const navigate = useNavigate(); // useNavigate for redirection after logout

  // Function to handle logout
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
        // Clear token from localStorage
        localStorage.removeItem("token");
  
        // Redirect to login page
        navigate("/login");
      } else if (response.status === 401) {
        console.error("Unauthorized: Invalid or expired token");
        // Optionally redirect to login page
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

      {/* Main Content Section */}
      <Card
        className="card-box mb-spacing-6-x2"
        style={{ textAlign: "center", padding: 50 }}
      >
        <img alt="CTA" src={projectLogo} width={"25%"} />
        <h1>
          བཙན་བྱོལ་བོད་མིའི་རང་དབང་གཅེས་འཛིན་དང་བླངས་དཔྱ་དངུལ་ལག་དེབ་གྲངས་མཛོད།
        </h1>
      </Card>
    </>
  );
}
