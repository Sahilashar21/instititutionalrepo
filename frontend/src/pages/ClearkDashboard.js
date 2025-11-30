// // src/pages/AdminDashboard.jsx
// import React from "react";
// import Navbar from "../components/HeroCarousel";
// import HeroCarousel from "../components/HeroCarousel";
// import ResourcesSection from "../components/ResourcesSection";
// import "../design/AdminDashboard.css"; // import the CSS we’ll extract from the HTML

// export default function AdminDashboard() {
//   const user = JSON.parse(localStorage.getItem("user"));

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     window.location.href = "/login"; // or use `useNavigate` from react-router
//   };

//   return (
//     <div className="container">
//       {/* Navbar from your components, styled */}
//       <nav>
//         <div className="user-info">
//           {user ? `Welcome, ${user.name}` : "Welcome, Admin"}
//         </div>
//         <button onClick={handleLogout}>Logout</button>
//       </nav>

//       {/* HeroCarousel Section */}
//       <section id="hero-carousel">
//         <h3>Hero Carousel</h3>
//         <HeroCarousel />
//       </section>

//       {/* Resources Section */}
//       <section id="resources-section">
//         <h3>Resources Section</h3>
//         <p>Explore the resources below to get started with your projects.</p>
//         <ResourcesSection />
//       </section>

   
//     </div>
//   );
// }



// src/pages/ClerkDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import HeroCarousel from "../components/HeroCarousel";
import ResourcesSection from "../components/ResourcesSection";
import "../design/AdminDashboard.css"; // reuse same CSS

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav>
        <button className="btn" onClick={() => navigate(-1)} aria-label="Go back">← Back</button>
        <div className="user-info">
          {user ? `Welcome, ${user.name}` : "Welcome, Clerk"}
        </div>
        <button className="btn" onClick={handleLogout} aria-label="Logout">Logout</button>
      </nav>

      {/* Hero Carousel */}
      <section id="hero-carousel">
        <h3>Gallery</h3>
        <HeroCarousel />
      </section>

      {/* Resources Section */}
      <section id="resources-section">
        <h3>Resources</h3>
        <p>Manage accession entries and clerical tasks.</p>
        <ResourcesSection role="clerk" />
      </section>

    </div>
  );
}


