import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const Navbar = ({ user, onLogout }) => {
  return (
    <AppBar position="sticky" color="primary" sx={{ zIndex: 1201 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", alignItems: "center", fontWeight: 600 }}
        >
          📚 College Repository
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button color="inherit" href="#about">
            About
          </Button>
          <Button color="inherit" href="#faculty">
            Faculty
          </Button>
          {user?.name && (
            <Typography
              variant="body1"
              component="span"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              👋 {user.name}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={onLogout}
            sx={{
              background: 'linear-gradient(90deg,var(--accent),#7c3aed)',
              color: 'linear-gradient(90deg,var(--accent),#7c3aed)',
              borderRadius: 1,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(99,102,241,0.18)',
              '&:hover': { opacity: 0.92 },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;


// import React from "react";
// import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

// const navStyle = {
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   padding: "1rem 2rem",
//   backgroundColor: "#1976d2",
//   color: "white",
//   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//   position: "sticky",
//   top: 0,
//   zIndex: 1000,
// };

// const Navbar = ({ user, onLogout }) => {
//   return (
//     <AppBar position="sticky" color="primary" sx={{ zIndex: 1201 }}>
//       <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//         <Typography variant="h6" component="div">
//           📚 College Repository
//         </Typography>

//         <Box>
//           <Button color="inherit" href="#about">
//             About
//           </Button>
//           <Button color="inherit" href="#faculty">
//             Faculty
//           </Button>
//           <Typography variant="body1" component="span" sx={{ mx: 2 }}>
//             👋 {user?.name}
//           </Typography>
//           <Button color="inherit" onClick={onLogout}>
//             Logout
//           </Button>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// };

// export default Navbar;
