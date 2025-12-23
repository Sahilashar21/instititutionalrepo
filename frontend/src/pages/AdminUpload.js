import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  MenuItem,
  Select,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import axios from "axios";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
const statusOptions = ["Available", "In Shelf", "Demolished"];

const formFieldsMap = {
  "question-papers": [
    { name: "year", label: "Year" },
    { name: "course", label: "Course", type: "dropdown", options: courseOptions },
    { name: "semester", label: "Semester", type: "dropdown", options: semesterOptions },
    { name: "subject", label: "Subject" },
    { name: "link", label: "Link" },
    { name: "status", label: "Status", type: "dropdown", options: statusOptions },
  ],
  "research-papers": [
    { name: "title", label: "Title" },
    { name: "author", label: "Author" },
    { name: "abstract", label: "Abstract" },
    { name: "link", label: "PDF Link" },
    { name: "status", label: "Status", type: "dropdown", options: statusOptions },
  ],
};

const SCOPES = "https://www.googleapis.com/auth/drive";

const AdminUpload = () => {
  const [resourceType, setResourceType] = useState("");
  const [formData, setFormData] = useState({});
  const [accessionNumber, setAccessionNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Google API state
  const [tokenClient, setTokenClient] = useState(null);
  const [gisReady, setGisReady] = useState(false);
  const [pickerReady, setPickerReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  /* =========================
     PREVIEW ACCESSION (SAFE)
  ========================== */
  const fetchAccessionNumber = async (type) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/accession/${type}/preview-accession`
      );
      setAccessionNumber(res.data.accessionNumber);
    } catch {
      setErrorMessage("Failed to fetch accession number");
    }
  };

  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setResourceType(type);
    setFormData({});
    setSuccessMessage("");
    setErrorMessage("");
    await fetchAccessionNumber(type);
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* =========================
     SUBMIT (BACKEND CREATES)
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resourceType) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BACKEND_URL}/api/accession/${resourceType}`,
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(
        `Uploaded successfully with Accession No: ${res.data.accessionNumber}`
      );

      // refresh preview for next upload
      await fetchAccessionNumber(resourceType);
      setFormData({});
      setErrorMessage("");
    } catch {
      setErrorMessage("Upload failed");
    }
  };

  /* =========================
     GOOGLE API LOAD
  ========================== */
  useEffect(() => {
    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.async = true;
    gisScript.onload = () => setGisReady(true);
    document.body.appendChild(gisScript);

    const pickerScript = document.createElement("script");
    pickerScript.src = "https://apis.google.com/js/api.js";
    pickerScript.async = true;
    pickerScript.onload = () => {
      window.gapi.load("picker", () => setPickerReady(true));
    };
    document.body.appendChild(pickerScript);
  }, []);

  useEffect(() => {
    if (gisReady && !tokenClient && GOOGLE_CLIENT_ID) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) return setErrorMessage("Google auth failed");
          setAccessToken(resp.access_token);
          openPicker(resp.access_token);
        },
      });
      setTokenClient(client);
    }
  }, [gisReady, tokenClient]);

  const openPicker = async (token) => {
    if (!pickerReady || !token) return;

    const view = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);
  };

  const pickerCallback = async (data) => {
    if (data.action !== window.google.picker.Action.PICKED) return;

    const file = data.docs[0];
    const fileId = file.id;

    try {
      await window.gapi.client.load("drive", "v3");

      await window.gapi.client.drive.permissions.create({
        fileId,
        resource: { role: "reader", type: "anyone" },
      });

      const res = await window.gapi.client.drive.files.get({
        fileId,
        fields: "webViewLink,name",
      });

      setFormData((p) => ({
        ...p,
        link: res.result.webViewLink,
        title: p.title || file.name,
      }));
    } catch {
      setErrorMessage("Failed to fetch Drive link");
    }
  };

  const openGooglePicker = () => {
    if (!tokenClient) return setErrorMessage("Google not ready");
    accessToken ? openPicker(accessToken) : tokenClient.requestAccessToken();
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" mt={4}>
        Upload Resource
      </Typography>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <FormControl fullWidth margin="normal">
        <InputLabel>Resource Type</InputLabel>
        <Select value={resourceType} onChange={handleTypeChange}>
          <MenuItem value="question-papers">QUESTION PAPERS</MenuItem>
          <MenuItem value="research-papers">RESEARCH PAPERS</MenuItem>
        </Select>
      </FormControl>

      {resourceType && (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Accession Number"
            value={accessionNumber}
            fullWidth
            disabled
            margin="normal"
          />

          <Button
            variant="outlined"
            fullWidth
            sx={{ mb: 1 }}
            onClick={openGooglePicker}
          >
            Pick / Upload from Google Drive
          </Button>

          {formFieldsMap[resourceType].map((field) =>
            field.type === "dropdown" ? (
              <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                >
                  {field.options.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                value={formData[field.name] || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            )
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Save
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default AdminUpload;










// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   MenuItem,
//   Select,
//   TextField,
//   Button,
//   Box,
//   FormControl,
//   InputLabel,
//   Alert,
// } from "@mui/material";
// import axios from "axios";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["Available", "In Shelf", "Demolished"];

// const formFieldsMap = {
//   "question-papers": [
//     { name: "year", label: "Year" },
//     { name: "course", label: "Course", type: "dropdown", options: courseOptions },
//     { name: "semester", label: "Semester", type: "dropdown", options: semesterOptions },
//     { name: "subject", label: "Subject" },
//     { name: "link", label: "Link" },
//     { name: "status", label: "Status", type: "dropdown", options: statusOptions },
//   ],
//   "research-papers": [
//     { name: "title", label: "Title" },
//     { name: "author", label: "Author" },
//     { name: "abstract", label: "Abstract" },
//     { name: "link", label: "PDF Link" },
//     { name: "status", label: "Status", type: "dropdown", options: statusOptions },
//   ],
// };

// const AdminUpload = () => {
//   const [resourceType, setResourceType] = useState("");
//   const [formData, setFormData] = useState({});
//   const [accessionNumber, setAccessionNumber] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   /* PREVIEW ACCESSION */
//   const fetchAccessionNumber = async (type) => {
//     try {
//       const res = await axios.get(
//         `${BACKEND_URL}/api/accession/${type}/preview-accession`
//       );
//       setAccessionNumber(res.data.accessionNumber);
//     } catch (err) {
//       setErrorMessage("Failed to fetch accession number");
//     }
//   };

//   const handleTypeChange = async (e) => {
//     const type = e.target.value;
//     setResourceType(type);
//     setFormData({});
//     setSuccessMessage("");
//     setErrorMessage("");
//     await fetchAccessionNumber(type);
//   };

//   const handleChange = (e) => {
//     setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
//   };
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!resourceType) {
//     setErrorMessage("Please select a resource type!");
//     return;
//   }

//   try {
//     const token = localStorage.getItem("token");

//     const res = await axios.post(
//       `${BACKEND_URL}/api/accession/${resourceType}`,
//       { ...formData },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     // ✅ show saved accession
//     setSuccessMessage(
//       `Uploaded successfully with Accession No: ${res.data.accessionNumber}`
//     );

//     // ✅ IMPORTANT: refresh preview for NEXT upload
//     await fetchAccessionNumber(resourceType);

//     setFormData({});
//     setErrorMessage("");
//   } catch (err) {
//     console.error(err);
//     setErrorMessage("Upload failed");
//   }
// };

//   return (
//     <Container maxWidth="sm">
//       <Typography variant="h4" mt={4}>
//         Upload Resource
//       </Typography>

//       {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
//       {successMessage && <Alert severity="success">{successMessage}</Alert>}

//       <FormControl fullWidth margin="normal">
//         <InputLabel>Resource Type</InputLabel>
//         <Select value={resourceType} onChange={handleTypeChange}>
//           <MenuItem value="question-papers">QUESTION PAPERS</MenuItem>
//           <MenuItem value="research-papers">RESEARCH PAPERS</MenuItem>
//         </Select>
//       </FormControl>

//       {resourceType && (
//         <Box component="form" onSubmit={handleSubmit}>
//           <TextField
//             label="Accession Number"
//             value={accessionNumber}
//             fullWidth
//             disabled
//             margin="normal"
//           />

//           {formFieldsMap[resourceType].map((field) =>
//             field.type === "dropdown" ? (
//               <FormControl fullWidth margin="normal" key={field.name}>
//                 <InputLabel>{field.label}</InputLabel>
//                 <Select
//                   name={field.name}
//                   value={formData[field.name] || ""}
//                   onChange={handleChange}
//                 >
//                   {field.options.map((o) => (
//                     <MenuItem key={o} value={o}>
//                       {o}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             ) : (
//               <TextField
//                 key={field.name}
//                 name={field.name}
//                 label={field.label}
//                 value={formData[field.name] || ""}
//                 onChange={handleChange}
//                 fullWidth
//                 margin="normal"
//               />
//             )
//           )}

//           <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
//             Save
//           </Button>
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default AdminUpload;

