import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { resourceFields } from "../config/resourceFieldConfig";
import "../design/ResourceViewer.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
const statusOptions = ["Available", "In Shelf", "Demolished"];

const ResourceViewer = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({});

  const fields = resourceFields[type] || [];

  // ✅ get logged in user role
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";

  // fetch resources
  const fetchResources = async (activeFilters = filters, activePage = page) => {
    setLoading(true);
    try {
      const params = { page: activePage, limit: 10 };

      Object.entries(activeFilters).forEach(([field, data]) => {
        if (data.value) params[field] = data.value;
      });

      const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`, {
        params,
      });

      setResources(res.data.resources || []);
      setTotalPages(res.data.totalPages || 1);

      if (Object.keys(filters).length === 0) {
        const initialFilters = {};
        fields.forEach((field) => {
          initialFilters[field.name] = { value: "" };
        });
        setFilters(initialFilters);
      }

      setError("");
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, page]);

  const handleFilterChange = (fieldName, selectedValue) => {
    setFilters({
      ...filters,
      [fieldName]: { value: selectedValue },
    });
  };

  const applyFilters = () => {
    fetchResources(filters, 1);
    setPage(1);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/resources/${type}/${id}`);
      setResources(resources.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete resource.");
    }
  };

  const handleUpdateClick = (res) => {
    setEditingResource(res);
    setFormData(res);
  };

  const handleSaveUpdate = async () => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/resources/${type}/${editingResource._id}`,
        formData
      );
      setResources(
        resources.map((r) => (r._id === res.data._id ? res.data : r))
      );
      setEditingResource(null);
    } catch (err) {
      console.error("Update failed", err);
      setError("Failed to update resource.");
    }
  };

  return (
    <div className="container" role="main" aria-label="Resource Viewer">
      <h1 id="page-title">Viewing: {type?.replace("-", " ").toUpperCase()}</h1>

      {loading && <p>Loading resources...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Filters */}
          <div className="filters" aria-label="Resource Filters">
            {fields.map((field) => {
              const value = filters[field.name]?.value || "";

              if (["course", "semester", "status"].includes(field.name)) {
                const options =
                  field.name === "course"
                    ? courseOptions
                    : field.name === "semester"
                    ? semesterOptions
                    : statusOptions;

                return (
                  <div key={field.name} className="filter-group">
                    <label>{field.label}</label>
                    <select
                      value={value}
                      onChange={(e) =>
                        handleFilterChange(field.name, e.target.value)
                      }
                    >
                      <option value="">All</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={field.name} className="filter-group">
                  <label>{field.label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleFilterChange(field.name, e.target.value)
                    }
                    placeholder={`Search ${field.label.toLowerCase()}...`}
                  />
                </div>
              );
            })}

            <button onClick={applyFilters} className="apply-filters-btn">
              Apply Filters
            </button>
          </div>

          {/* Resource Cards */}
          <div
            id="resources-list"
            className="cards-grid"
            aria-live="polite"
            aria-relevant="additions removals"
          >
            {resources.length > 0 ? (
              resources.map((res) => (
                <div
                  key={res._id}
                  className="card"
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${res.title}`}
                  onClick={() => navigate(`/resources/${type}/${res._id}`)}
                >
                  {res.status && (
                    <span
                      className={`chip ${res.status
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                    >
                      {res.status}
                    </span>
                  )}

                  <h3>{res.title}</h3>

                  {fields.map((field) => {
                    if (field.name === "link" || field.name === "status")
                      return null;

                    const value = res[field.name];
                    if (!value) return null;

                    return (
                      <p key={field.name}>
                        {field.label}: {String(value).toUpperCase()}
                      </p>
                    );
                  })}

                  {res.link && (
                    <p>
                      <a
                        href={
                          res.link.startsWith("http")
                            ? res.link
                            : `http://${res.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open Resource
                      </a>
                    </p>
                  )}

                  {/* ✅ Update + Delete only for admin/clerk */}
                  {["admin", "clerk"].includes(role) && (
                    <div className="card-actions">
                      <button
                        className="action-btn primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateClick(res);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(res._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p
                id="no-results"
                style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}
              >
                No resources match the selected filters.
              </p>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination-controls">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ✅ Modal Overlay */}
      {editingResource && (
        <div
          className="modal"
          onClick={() => setEditingResource(null)} // close on background click
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h3>Edit Resource</h3>
            {fields.map((field) => (
              <div key={field.name} style={{ marginBottom: "1rem" }}>
                <label>{field.label}</label>
                <input
                  type="text"
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.name]: e.target.value })
                  }
                />
              </div>
            ))}
            <button className="action-btn primary" onClick={handleSaveUpdate}>Save</button>
            <button className="action-btn" onClick={() => setEditingResource(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceViewer;












// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { resourceFields } from "../config/resourceFieldConfig";
// import "../design/ResourceViewer.css";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["Available", "In Shelf", "Demolished"];

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();

//   const [resources, setResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // pagination state
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // update/edit state
//   const [editingResource, setEditingResource] = useState(null);
//   const [formData, setFormData] = useState({});

//   const fields = resourceFields[type] || [];

//   // fetch resources
//   const fetchResources = async (activeFilters = filters, activePage = page) => {
//     setLoading(true);
//     try {
//       const params = { page: activePage, limit: 10 };

//       // append filters
//       Object.entries(activeFilters).forEach(([field, data]) => {
//         if (data.value) params[field] = data.value;
//       });

//       const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`, {
//         params,
//       });

//       setResources(res.data.resources || []);
//       setTotalPages(res.data.totalPages || 1);

//       // initialize filters on first load
//       if (Object.keys(filters).length === 0) {
//         const initialFilters = {};
//         fields.forEach((field) => {
//           initialFilters[field.name] = { value: "" };
//         });
//         setFilters(initialFilters);
//       }

//       setError("");
//     } catch (err) {
//       console.error("API error:", err);
//       setError("Failed to fetch resources.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchResources(filters, page);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [type, page]);

//   // update filter state only (not fetching immediately)
//   const handleFilterChange = (fieldName, selectedValue) => {
//     setFilters({
//       ...filters,
//       [fieldName]: { value: selectedValue },
//     });
//   };

//   // fetch when Apply button clicked
//   const applyFilters = () => {
//     fetchResources(filters, 1);
//     setPage(1);
//   };

//   // delete resource
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${BACKEND_URL}/api/resources/${id}`);
//       setResources(resources.filter((r) => r._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//       setError("Failed to delete resource.");
//     }
//   };

//   // open update modal
//   const handleUpdateClick = (res) => {
//     setEditingResource(res);
//     setFormData(res);
//   };

//   // save update
//   const handleSaveUpdate = async () => {
//     try {
//       const res = await axios.put(
//         `${BACKEND_URL}/api/resources/${editingResource._id}`,
//         formData
//       );
//       setResources(
//         resources.map((r) => (r._id === res.data._id ? res.data : r))
//       );
//       setEditingResource(null);
//     } catch (err) {
//       console.error("Update failed", err);
//       setError("Failed to update resource.");
//     }
//   };

//   return (
//     <div className="container" role="main" aria-label="Resource Viewer">
//       <h1 id="page-title">Viewing: {type?.replace("-", " ").toUpperCase()}</h1>

//       {loading && <p>Loading resources...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && (
//         <>
//           {/* Filters */}
//           <div className="filters" aria-label="Resource Filters">
//             {fields.map((field) => {
//               const value = filters[field.name]?.value || "";

//               if (["course", "semester", "status"].includes(field.name)) {
//                 const options =
//                   field.name === "course"
//                     ? courseOptions
//                     : field.name === "semester"
//                     ? semesterOptions
//                     : statusOptions;

//                 return (
//                   <div key={field.name} className="filter-group">
//                     <label>{field.label}</label>
//                     <select
//                       value={value}
//                       onChange={(e) =>
//                         handleFilterChange(field.name, e.target.value)
//                       }
//                     >
//                       <option value="">All</option>
//                       {options.map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={field.name} className="filter-group">
//                   <label>{field.label}</label>
//                   <input
//                     type="text"
//                     value={value}
//                     onChange={(e) =>
//                       handleFilterChange(field.name, e.target.value)
//                     }
//                     placeholder={`Search ${field.label.toLowerCase()}...`}
//                   />
//                 </div>
//               );
//             })}

//             <button onClick={applyFilters} className="apply-filters-btn">
//               Apply Filters
//             </button>
//           </div>

//           {/* Resource Cards */}
//           <div
//             id="resources-list"
//             className="cards-grid"
//             aria-live="polite"
//             aria-relevant="additions removals"
//           >
//             {resources.length > 0 ? (
//               resources.map((res) => (
//                 <div
//                   key={res._id}
//                   className="card"
//                   role="button"
//                   tabIndex={0}
//                   aria-label={`View details for ${res.title}`}
//                   onClick={() => navigate(`/resources/${type}/${res._id}`)}
//                 >
//                   {/* Status chip */}
//                   {res.status && (
//                     <span
//                       className={`chip ${res.status
//                         .replace(/\s+/g, "-")
//                         .toLowerCase()}`}
//                     >
//                       {res.status}
//                     </span>
//                   )}

//                   {/* Title */}
//                   <h3>{res.title}</h3>

//                   {/* Show all metadata dynamically except link and status */}
//                   {fields.map((field) => {
//                     if (field.name === "link" || field.name === "status")
//                       return null;

//                     const value = res[field.name];
//                     if (!value) return null;

//                     return (
//                       <p key={field.name}>
//                         {field.label}: {String(value).toUpperCase()}
//                       </p>
//                     );
//                   })}

//                   {/* Link */}
//                   {res.link && (
//                     <p>
//                       <a
//                         href={
//                           res.link.startsWith("http")
//                             ? res.link
//                             : `http://${res.link}`
//                         }
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="link"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         Open Resource
//                       </a>
//                     </p>
//                   )}

//                   {/* ✅ Update + Delete Buttons */}
//                   <div className="card-actions">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleUpdateClick(res);
//                       }}
//                     >
//                       Update
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDelete(res._id);
//                       }}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p
//                 id="no-results"
//                 style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}
//               >
//                 No resources match the selected filters.
//               </p>
//             )}
//           </div>

//           {/* Pagination Controls */}
//           <div className="pagination-controls">
//             <button
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               disabled={page === 1}
//             >
//               Prev
//             </button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//               disabled={page === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}

//       {/* ✅ Update Modal */}
//       {editingResource && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Edit Resource</h3>
//             {fields.map((field) => (
//               <div key={field.name}>
//                 <label>{field.label}</label>
//                 <input
//                   type="text"
//                   value={formData[field.name] || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, [field.name]: e.target.value })
//                   }
//                 />
//               </div>
//             ))}
//             <button onClick={handleSaveUpdate}>Save</button>
//             <button onClick={() => setEditingResource(null)}>Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ResourceViewer;











// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { resourceFields } from "../config/resourceFieldConfig";
// import "../design/ResourceViewer.css";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["Available", "In Shelf", "Demolished"];

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();

//   const [resources, setResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // pagination state
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fields = resourceFields[type] || [];

//   // fetch resources
//   const fetchResources = async (activeFilters = filters, activePage = page) => {
//     setLoading(true);
//     try {
//       const params = { page: activePage, limit: 10 };

//       // append filters
//       Object.entries(activeFilters).forEach(([field, data]) => {
//         if (data.value) params[field] = data.value;
//       });

//       const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`, { params });

//       setResources(res.data.resources || []);
//       setTotalPages(res.data.totalPages || 1);

//       // initialize filters on first load
//       if (Object.keys(filters).length === 0) {
//         const initialFilters = {};
//         fields.forEach((field) => {
//           initialFilters[field.name] = { value: "" };
//         });
//         setFilters(initialFilters);
//       }

//       setError("");
//     } catch (err) {
//       console.error("API error:", err);
//       setError("Failed to fetch resources.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchResources(filters, page);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [type, page]);

//   // update filter state only (not fetching immediately)
//   const handleFilterChange = (fieldName, selectedValue) => {
//     setFilters({
//       ...filters,
//       [fieldName]: { value: selectedValue },
//     });
//   };

//   // fetch when Apply button clicked
//   const applyFilters = () => {
//     fetchResources(filters, 1);
//     setPage(1);
//   };

//   return (
//     <div className="container" role="main" aria-label="Resource Viewer">
//       <h1 id="page-title">Viewing: {type?.replace("-", " ").toUpperCase()}</h1>

//       {loading && <p>Loading resources...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && (
//         <>
//           {/* Filters */}
//           <div className="filters" aria-label="Resource Filters">
//             {fields.map((field) => {
//               const value = filters[field.name]?.value || "";

//               if (["course", "semester", "status"].includes(field.name)) {
//                 const options =
//                   field.name === "course"
//                     ? courseOptions
//                     : field.name === "semester"
//                     ? semesterOptions
//                     : statusOptions;

//                 return (
//                   <div key={field.name} className="filter-group">
//                     <label>{field.label}</label>
//                     <select
//                       value={value}
//                       onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     >
//                       <option value="">All</option>
//                       {options.map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={field.name} className="filter-group">
//                   <label>{field.label}</label>
//                   <input
//                     type="text"
//                     value={value}
//                     onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     placeholder={`Search ${field.label.toLowerCase()}...`}
//                   />
//                 </div>
//               );
//             })}

//             {/* ✅ Apply Filters Button */}
//             <button onClick={applyFilters} className="apply-filters-btn">
//               Apply Filters
//             </button>
//           </div>

//           {/* Resource Cards */}
//           <div
//             id="resources-list"
//             className="cards-grid"
//             aria-live="polite"
//             aria-relevant="additions removals"
//           >
//             {resources.length > 0 ? (
//               resources.map((res) => (
//                 <div
//                   key={res._id}
//                   className="card"
//                   role="button"
//                   tabIndex={0}
//                   aria-label={`View details for ${res.title}`}
//                   onClick={() => navigate(`/resources/${type}/${res._id}`)}
//                 >
//                   {/* Status chip */}
//                   {res.status && (
//                     <span
//                       className={`chip ${res.status.replace(/\s+/g, "-").toLowerCase()}`}
//                     >
//                       {res.status}
//                     </span>
//                   )}

//                   {/* Title */}
//                   <h3>{res.title}</h3>

//                   {/* Show all metadata dynamically except link and status */}
//                   {fields.map((field) => {
//                     if (field.name === "link" || field.name === "status") return null;

//                     const value = res[field.name];
//                     if (!value) return null;

//                     return (
//                       <p key={field.name}>
//                         {field.label}: {String(value).toUpperCase()}
//                       </p>
//                     );
//                   })}

//                   {/* Link */}
//                   {res.link && (
//                     <p>
//                       <a
//                         href={res.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="link"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         Open Resource
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p
//                 id="no-results"
//                 style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}
//               >
//                 No resources match the selected filters.
//               </p>
//             )}
//           </div>

//           {/* Pagination Controls */}
//           <div className="pagination-controls">
//             <button
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               disabled={page === 1}
//             >
//               Prev
//             </button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//               disabled={page === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ResourceViewer;




// // src/pages/ResourceViewer.js
// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import debounce from "lodash.debounce";
// import { resourceFields } from "../config/resourceFieldConfig";
// import "../design/ResourceViewer.css";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["available", "in shelf", "demolished"];

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();

//   const [resources, setResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // ✅ Pagination state
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fields = resourceFields[type] || [];

//   // ✅ Fetch resources with pagination + filters
//   const fetchResources = async (activeFilters, activePage) => {
//     setLoading(true);
//     try {
//       const params = { page: activePage, limit: 10 };

//       // append filters (only filled ones)
//       Object.entries(activeFilters).forEach(([field, data]) => {
//         if (data.value) params[field] = data.value;
//       });

//       const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`, { params });

//       setResources(res.data.resources || []);
//       setTotalPages(res.data.totalPages || 1);

//       // init filters if first time
//       if (Object.keys(activeFilters).length === 0) {
//         const initialFilters = {};
//         fields.forEach((field) => {
//           initialFilters[field.name] = { value: "" };
//         });
//         setFilters(initialFilters);
//       }

//       setError("");
//     } catch (err) {
//       console.error("API error:", err);
//       setError("Failed to fetch resources.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Debounce filter call
//   const debouncedFetch = useCallback(
//     debounce((updatedFilters) => {
//       fetchResources(updatedFilters, 1); // reset to first page
//       setPage(1);
//     }, 500),
//     [type]
//   );

//   // Initial + pagination fetch
//   useEffect(() => {
//     fetchResources(filters, page);
//   }, [type, page]);

//   const handleFilterChange = (fieldName, selectedValue) => {
//     const updatedFilters = {
//       ...filters,
//       [fieldName]: { value: selectedValue },
//     };
//     setFilters(updatedFilters);
//     debouncedFetch(updatedFilters);
//   };

//   return (
//     <div className="container" role="main" aria-label="Resource Viewer">
//       <h1 id="page-title">Viewing: {type?.replace("-", " ").toUpperCase()}</h1>

//       {loading && <p>Loading resources...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && (
//         <>
//           {/* Filters */}
//           <div className="filters" aria-label="Resource Filters">
//             {fields.map((field) => {
//               const value = filters[field.name]?.value || "";

//               if (["course", "semester", "status"].includes(field.name)) {
//                 const options =
//                   field.name === "course"
//                     ? courseOptions
//                     : field.name === "semester"
//                     ? semesterOptions
//                     : statusOptions;

//                 return (
//                   <div key={field.name} className="filter-group">
//                     <label>{field.label}</label>
//                     <select
//                       value={value}
//                       onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     >
//                       <option value="">All</option>
//                       {options.map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={field.name} className="filter-group">
//                   <label>{field.label}</label>
//                   <input
//                     type="text"
//                     value={value}
//                     onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     placeholder={`Search ${field.label.toLowerCase()}...`}
//                   />
//                 </div>
//               );
//             })}
//           </div>

//           {/* Resource Cards */}
//           <div
//             id="resources-list"
//             className="cards-grid"
//             aria-live="polite"
//             aria-relevant="additions removals"
//           >
//             {resources.length > 0 ? (
//               resources.map((res) => (
//                 <div
//                   key={res._id}
//                   className="card"
//                   role="button"
//                   tabIndex={0}
//                   aria-label={`View details for ${res.title}`}
//                   onClick={() => navigate(`/resources/${type}/${res._id}`)}
//                 >
//                   {/* Status chip */}
//                   {res.status && (
//                     <span
//                       className={`chip ${res.status.replace(/\s+/g, "-").toLowerCase()}`}
//                     >
//                       {res.status}
//                     </span>
//                   )}

//                   {/* Title */}
//                   <h3>{res.title}</h3>

//                   {/* Show all metadata except link & status */}
//                   {fields.map((field) => {
//                     if (field.name === "link" || field.name === "status") return null;
//                     const value = res[field.name];
//                     if (!value) return null;

//                     return (
//                       <p key={field.name}>
//                         {field.label}: {String(value).toUpperCase()}
//                       </p>
//                     );
//                   })}

//                   {/* Link */}
//                   {res.link && (
//                     <p>
//                       <a
//                         href={res.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="link"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         Open Resource
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p
//                 id="no-results"
//                 style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}
//               >
//                 No resources match the selected filters.
//               </p>
//             )}
//           </div>

//           {/* ✅ Pagination Controls */}
//           {totalPages > 1 && (
//             <div className="pagination-controls">
//               <button
//                 onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                 disabled={page === 1}
//               >
//                 Prev
//               </button>
//               <span>
//                 Page {page} of {totalPages}
//               </span>
//               <button
//                 onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={page === totalPages}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ResourceViewer;



// // src/pages/ResourceViewer.js
// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import debounce from "lodash.debounce";
// import { resourceFields } from "../config/resourceFieldConfig";
// import "../design/ResourceViewer.css";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["available", "in shelf", "demolished"];

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();
//   const [resources, setResources] = useState([]);
//   const [filteredResources, setFilteredResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // ✅ Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const fields = resourceFields[type] || [];

//   // Fetch resources
//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
//         const allResources = res.data.resources || [];

//         setResources(allResources);
//         setFilteredResources(allResources);

//         // initialize filters
//         const initialFilters = {};
//         fields.forEach((field) => {
//           initialFilters[field.name] = { value: "" };
//         });
//         setFilters(initialFilters);
//       } catch (err) {
//         console.error("API error:", err);
//         setError("Failed to fetch resources.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, [type, fields]);

//   // ✅ Debounced filter function
//   const applyFilters = useCallback(
//     debounce((updatedFilters, allResources) => {
//       const filtered = allResources.filter((res) =>
//         Object.entries(updatedFilters).every(([field, data]) =>
//           data.value
//             ? String(res[field] || "")
//                 .toLowerCase()
//                 .includes(String(data.value).toLowerCase())
//             : true
//         )
//       );
//       setFilteredResources(filtered);
//       setCurrentPage(1); // reset to first page
//     }, 400),
//     []
//   );

//   const handleFilterChange = (fieldName, selectedValue) => {
//     const updatedFilters = {
//       ...filters,
//       [fieldName]: { value: selectedValue },
//     };
//     setFilters(updatedFilters);

//     applyFilters(updatedFilters, resources);
//   };

//   // ✅ Pagination logic
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentResources = filteredResources.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

//   return (
//     <div className="container" role="main" aria-label="Resource Viewer">
//       <h1 id="page-title">Viewing: {type?.replace("-", " ").toUpperCase()}</h1>

//       {loading && <p>Loading resources...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && (
//         <>
//           {/* Filters */}
//           <div className="filters" aria-label="Resource Filters">
//             {fields.map((field) => {
//               const value = filters[field.name]?.value || "";

//               if (["course", "semester", "status"].includes(field.name)) {
//                 const options =
//                   field.name === "course"
//                     ? courseOptions
//                     : field.name === "semester"
//                     ? semesterOptions
//                     : statusOptions;

//                 return (
//                   <div key={field.name} className="filter-group">
//                     <label>{field.label}</label>
//                     <select
//                       value={value}
//                       onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     >
//                       <option value="">All</option>
//                       {options.map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={field.name} className="filter-group">
//                   <label>{field.label}</label>
//                   <input
//                     type="text"
//                     value={value}
//                     onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     placeholder={`Search ${field.label.toLowerCase()}...`}
//                   />
//                 </div>
//               );
//             })}
//           </div>

//           {/* Resource Cards */}
//           <div
//             id="resources-list"
//             className="cards-grid"
//             aria-live="polite"
//             aria-relevant="additions removals"
//           >
//             {currentResources.length > 0 ? (
//               currentResources.map((res) => (
//                 <div
//                   key={res._id}
//                   className="card"
//                   role="button"
//                   tabIndex={0}
//                   aria-label={`View details for ${res.title}`}
//                   onClick={() => navigate(`/resources/${type}/${res._id}`)}
//                 >
//                   {/* Status chip */}
//                   {res.status && (
//                     <span
//                       className={`chip ${res.status.replace(/\s+/g, "-").toLowerCase()}`}
//                     >
//                       {res.status}
//                     </span>
//                   )}

//                   {/* Title */}
//                   <h3>{res.title}</h3>

//                   {/* Show all metadata dynamically except link & status */}
//                   {fields.map((field) => {
//                     if (field.name === "link" || field.name === "status") return null;
//                     const value = res[field.name];
//                     if (!value) return null;

//                     return (
//                       <p key={field.name}>
//                         {field.label}: {String(value).toUpperCase()}
//                       </p>
//                     );
//                   })}

//                   {/* Link */}
//                   {res.link && (
//                     <p>
//                       <a
//                         href={res.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="link"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         Open Resource
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p
//                 id="no-results"
//                 style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}
//               >
//                 No resources match the selected filters.
//               </p>
//             )}
//           </div>

//           {/* ✅ Pagination controls */}
//           {totalPages > 1 && (
//             <div className="pagination">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 disabled={currentPage === 1}
//               >
//                 Prev
//               </button>

//               <span>
//                 Page {currentPage} of {totalPages}
//               </span>

//               <button
//                 onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ResourceViewer;








// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { resourceFields } from "../config/resourceFieldConfig";
// import "../design/ResourceViewer.css";
// import debounce from "lodash.debounce";


// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["available", "in shelf", "demolished"];

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();

//   const [resources, setResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // pagination state
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fields = resourceFields[type] || [];

//   useEffect(() => {
//     const fetchResources = async () => {
//       setLoading(true);
//       try {
//         const params = { page, limit: 10 };

//         // append filters
//         Object.entries(filters).forEach(([field, data]) => {
//           if (data.value) params[field] = data.value;
//         });

//         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`, { params });

//         setResources(res.data.resources || []);
//         setTotalPages(res.data.totalPages || 1);

//         // initialize filters on first load
//         if (Object.keys(filters).length === 0) {
//           const initialFilters = {};
//           fields.forEach((field) => {
//             initialFilters[field.name] = { value: "" };
//           });
//           setFilters(initialFilters);
//         }

//         setError("");
//       } catch (err) {
//         console.error("API error:", err);
//         setError("Failed to fetch resources.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, [type, page, filters]);

  
//   const handleFilterChange = (fieldName, selectedValue) => {
//     const updatedFilters = {
//       ...filters,
//       [fieldName]: { value: selectedValue },
//     };
//     setFilters(updatedFilters);
//     setPage(1); // reset to first page on filter change
//   };

//   return (
//     <div className="container" role="main" aria-label="Resource Viewer">
//       <h1 id="page-title">Viewing: {type?.replace("-", " ").toUpperCase()}</h1>

//       {loading && <p>Loading resources...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && (
//         <>
//           {/* Filters */}
//           <div className="filters" aria-label="Resource Filters">
//             {fields.map((field) => {
//               const value = filters[field.name]?.value || "";

//               if (["course", "semester", "status"].includes(field.name)) {
//                 const options =
//                   field.name === "course"
//                     ? courseOptions
//                     : field.name === "semester"
//                     ? semesterOptions
//                     : statusOptions;

//                 return (
//                   <div key={field.name} className="filter-group">
//                     <label>{field.label}</label>
//                     <select
//                       value={value}
//                       onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     >
//                       <option value="">All</option>
//                       {options.map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={field.name} className="filter-group">
//                   <label>{field.label}</label>
//                   <input
//                     type="text"
//                     value={value}
//                     onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     placeholder={`Search ${field.label.toLowerCase()}...`}
//                   />
//                 </div>
//               );
//             })}
//           </div>

//           {/* Resource Cards */}
//           <div
//             id="resources-list"
//             className="cards-grid"
//             aria-live="polite"
//             aria-relevant="additions removals"
//           >
//             {resources.length > 0 ? (
//               resources.map((res) => (
//                 <div
//                   key={res._id}
//                   className="card"
//                   role="button"
//                   tabIndex={0}
//                   aria-label={`View details for ${res.title}`}
//                   onClick={() => navigate(`/resources/${type}/${res._id}`)}
//                 >
//                   {/* Status chip */}
//                   {res.status && (
//                     <span
//                       className={`chip ${res.status.replace(/\s+/g, "-").toLowerCase()}`}
//                     >
//                       {res.status}
//                     </span>
//                   )}

//                   {/* Title */}
//                   <h3>{res.title}</h3>

//                   {/* Show all metadata dynamically except link and status */}
//                     {fields.map((field) => {
//                       if (field.name === "link" || field.name === "status") return null; // skip link & status chip

//                       const value = res[field.name];
//                       if (!value) return null;

//                       return (
//                         <p key={field.name}>
//                           {field.label}: {String(value).toUpperCase()}
//                         </p>
//                       );
//                     })}


//                   {/* Link */}
//                   {res.link && (
//                     <p>
//                       <a
//                         href={res.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="link"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         Open Resource
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p
//                 id="no-results"
//                 style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}
//               >
//                 No resources match the selected filters.
//               </p>
//             )}
//           </div>

//           {/* Pagination Controls */}
//           <div className="pagination-controls">
//             <button
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               disabled={page === 1}
//             >
//               Prev
//             </button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//               disabled={page === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ResourceViewer;









// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { resourceFields } from "../config/resourceFieldConfig";
// import "../design/ResourceViewer.css"; // bring in the HTML CSS

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["available", "in shelf", "demolished"];

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();
//   const [resources, setResources] = useState([]);
//   const [filteredResources, setFilteredResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fields = resourceFields[type] || [];

//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
//         const allResources = res.data.resources || [];

//         setResources(allResources);
//         setFilteredResources(allResources);

//         // initialize filters
//         const initialFilters = {};
//         fields.forEach((field) => {
//           initialFilters[field.name] = { value: "" };
//         });
//         setFilters(initialFilters);
//       } catch (err) {
//         console.error("API error:", err);
//         setError("Failed to fetch resources.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, [type]);

//   const handleFilterChange = (fieldName, selectedValue) => {
//     const updatedFilters = {
//       ...filters,
//       [fieldName]: { value: selectedValue },
//     };
//     setFilters(updatedFilters);

//     const filtered = resources.filter((res) =>
//       Object.entries(updatedFilters).every(([field, data]) =>
//         data.value
//           ? String(res[field]).toLowerCase().includes(String(data.value).toLowerCase())
//           : true
//       )
//     );
//     setFilteredResources(filtered);
//   };

//   return (
//     <div className="container" role="main" aria-label="Resource Viewer">
//       <h1 id="page-title">Viewing: {type?.replace("-", " ").toUpperCase()}</h1>

//       {loading && <p>Loading resources...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && (
//         <>
//           {/* Filters */}
//           <div className="filters" aria-label="Resource Filters">
//             {fields.map((field) => {
//               const value = filters[field.name]?.value || "";

//               if (["course", "semester", "status"].includes(field.name)) {
//                 const options =
//                   field.name === "course"
//                     ? courseOptions
//                     : field.name === "semester"
//                     ? semesterOptions
//                     : statusOptions;

//                 return (
//                   <div key={field.name} className="filter-group">
//                     <label>{field.label}</label>
//                     <select
//                       value={value}
//                       onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     >
//                       <option value="">All</option>
//                       {options.map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={field.name} className="filter-group">
//                   <label>{field.label}</label>
//                   <input
//                     type="text"
//                     value={value}
//                     onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                     placeholder={`Search ${field.label.toLowerCase()}...`}
//                   />
//                 </div>
//               );
//             })}
//           </div>

//           {/* Resource Cards */}
//           <div
//             id="resources-list"
//             className="cards-grid"
//             aria-live="polite"
//             aria-relevant="additions removals"
//           >
//             {filteredResources.length > 0 ? (
//               filteredResources.map((res) => (
//                 <div
//                   key={res._id}
//                   className="card"
//                   role="button"
//                   tabIndex={0}
//                   aria-label={`View details for ${res.title}`}
//                   onClick={() => navigate(`/resources/${type}/${res._id}`)}
//                 >
//                   {/* Status chip */}
//                   {res.status && (
//                     <span
//                       className={`chip ${res.status.replace(/\s+/g, "-").toLowerCase()}`}
//                     >
//                       {res.status}
//                     </span>
//                   )}

//                   {/* Title */}
//                   <h3>{res.title}</h3>

//                   {/* Show course, semester
//                   {res.course && <p>Course: {res.course.toUpperCase()}</p>}
//                   {res.semester && <p>Semester: {res.semester}</p>} */}

//               {/* Show all metadata dynamically except link and status */}
// {fields.map((field) => {
//   if (field.name === "link" || field.name === "status") return null; // skip link & status chip

//   const value = res[field.name];
//   if (!value) return null;

//   return (
//     <p key={field.name}>
//       {field.label}: {String(value).toUpperCase()}
//     </p>
//   );
// })}
                  

//                   {/* Link */}
//                   {res.link && (
//                     <p>
//                       <a
//                         href={res.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="link"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         Open Resource
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p
//                 id="no-results"
//                 style={{ textAlign: "center", marginTop: "2rem", color: "#777" }}
//               >
//                 No resources match the selected filters.
//               </p>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ResourceViewer;














// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Alert,
//   Card,
//   CardContent,
//   Chip,
//   Link as MuiLink,
//   Grid,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { resourceFields } from "../config/resourceFieldConfig";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const courseOptions = ["bcom", "bscit", "bvoc sd", "bms"];
// const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
// const statusOptions = ["available", "in shelf", "demolished"];

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();
//   const [resources, setResources] = useState([]);
//   const [filteredResources, setFilteredResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fields = resourceFields[type] || [];

//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
//         const allResources = res.data.resources || [];

//         setResources(allResources);
//         setFilteredResources(allResources);

//         // Initialize filter values
//         const initialFilters = {};
//         fields.forEach((field) => {
//           initialFilters[field.name] = { value: "" };
//         });

//         setFilters(initialFilters);
//       } catch (err) {
//         console.error("API error:", err);
//         setError("Failed to fetch resources.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, [type]);

//   const handleFilterChange = (fieldName, selectedValue) => {
//     const updatedFilters = {
//       ...filters,
//       [fieldName]: { value: selectedValue },
//     };

//     setFilters(updatedFilters);

//     const filtered = resources.filter((res) =>
//       Object.entries(updatedFilters).every(([field, data]) =>
//         data.value ? String(res[field]).toLowerCase().includes(String(data.value).toLowerCase()) : true
//       )
//     );

//     setFilteredResources(filtered);
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom mt={4}>
//         Viewing: {type?.replace("-", " ").toUpperCase()}
//       </Typography>

//       {loading && <CircularProgress />}
//       {error && <Alert severity="error">{error}</Alert>}

//       {/* Filters UI */}
//       {!loading && !error && (
//         <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
//           {fields.map((field) => {
//             const value = filters[field.name]?.value || "";

//             // Dropdown fields
//             if (["course", "semester", "status"].includes(field.name)) {
//               const options =
//                 field.name === "course"
//                   ? courseOptions
//                   : field.name === "semester"
//                   ? semesterOptions
//                   : statusOptions;

//               return (
//                 <FormControl key={field.name} size="small" sx={{ minWidth: 160 }}>
//                   <InputLabel>{field.label}</InputLabel>
//                   <Select
//                     value={value}
//                     label={field.label}
//                     onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                   >
//                     <MenuItem value="">All</MenuItem>
//                     {options.map((opt) => (
//                       <MenuItem key={opt} value={opt}>
//                         {opt}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               );
//             }

//             // Text input filters
//             return (
//               <FormControl key={field.name} size="small" sx={{ minWidth: 160 }}>
//                 <InputLabel shrink>{field.label}</InputLabel>
//                 <input
//                   type="text"
//                   value={value}
//                   onChange={(e) => handleFilterChange(field.name, e.target.value)}
//                   style={{
//                     padding: "8px",
//                     border: "1px solid #ccc",
//                     borderRadius: "4px",
//                     width: "100%",
//                   }}
//                 />
//               </FormControl>
//             );
//           })}
//         </Box>
//       )}

//       {!loading && !error && filteredResources.length === 0 && (
//         <Typography mt={3}>No resources match the selected filters.</Typography>
//       )}

//       <Grid container spacing={2} mt={2}>
//         {filteredResources.map((res) => (
//           <Grid item xs={12} sm={6} md={4} key={res._id}>
//             <Card
//               variant="outlined"
//               onClick={() => navigate(`/resources/${type}/${res._id}`)}
//               sx={{
//                 cursor: "pointer",
//                 "&:hover": { boxShadow: 3, backgroundColor: "#f9f9f9" },
//               }}
//             >
//               <CardContent>
//                 {fields.map((field) => {
//                   const value = res[field.name];

//                   if (field.name === "status") {
//                     return (
//                       <Chip
//                         key={field.name}
//                         label={value}
//                         color={
//                           value === "Available"
//                             ? "success"
//                             : value === "In Shelf"
//                             ? "warning"
//                             : value === "Demolished"
//                             ? "error"
//                             : "default"
//                         }
//                         sx={{ mb: 1 }}
//                       />
//                     );
//                   }

//                   if (field.name === "link" && value) {
//                     return (
//                       <Typography key={field.name} variant="body2">
//                         <strong>{field.label}:</strong>{" "}
//                         <MuiLink
//                           href={value}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           Open
//                         </MuiLink>
//                       </Typography>
//                     );
//                   }

//                   return (
//                     <Typography key={field.name} variant="body2">
//                       <strong>{field.label}:</strong> {value || "N/A"}
//                     </Typography>
//                   );
//                 })}
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// };

// export default ResourceViewer;




















// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Alert,
//   Card,
//   CardContent,
//   Chip,
//   Link as MuiLink,
//   Grid,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { resourceFields } from "../config/resourceFieldConfig";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();
//   const [resources, setResources] = useState([]);
//   const [filteredResources, setFilteredResources] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fields = resourceFields[type] || [];

//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
//         const allResources = res.data.resources || [];

//         setResources(allResources);
//         setFilteredResources(allResources);

//         // Initialize filters with unique values
//         const initialFilters = {};
//         fields.forEach((field) => {
//           const values = [...new Set(allResources.map((r) => r[field.name]).filter(Boolean))];
//           initialFilters[field.name] = { value: "", options: values };
//         });

//         setFilters(initialFilters);
//       } catch (err) {
//         console.error("API error:", err);
//         setError("Failed to fetch resources.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, [type]);

//   const handleFilterChange = (fieldName, selectedValue) => {
//     const updatedFilters = {
//       ...filters,
//       [fieldName]: { ...filters[fieldName], value: selectedValue },
//     };

//     setFilters(updatedFilters);

//     const filtered = resources.filter((res) =>
//       Object.entries(updatedFilters).every(([field, data]) =>
//         data.value ? res[field] === data.value : true
//       )
//     );

//     setFilteredResources(filtered);
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom mt={4}>
//         Viewing: {type?.replace("-", " ").toUpperCase()}
//       </Typography>

//       {loading && <CircularProgress />}
//       {error && <Alert severity="error">{error}</Alert>}

//       {/* Filters */}
//       {!loading && !error && (
//         <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
//           {Object.entries(filters).map(([fieldName, { value, options }]) => (
//             options.length > 1 && (
//               <FormControl key={fieldName} size="small" sx={{ minWidth: 160 }}>
//                 <InputLabel>{fieldName}</InputLabel>
//                 <Select
//                   value={value}
//                   label={fieldName}
//                   onChange={(e) => handleFilterChange(fieldName, e.target.value)}
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   {options.map((opt) => (
//                     <MenuItem key={opt} value={opt}>
//                       {opt}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             )
//           ))}
//         </Box>
//       )}

//       {!loading && !error && filteredResources.length === 0 && (
//         <Typography mt={3}>No resources match the selected filters.</Typography>
//       )}

//       <Grid container spacing={2} mt={2}>
//         {filteredResources.map((res) => (
//           <Grid item xs={12} sm={6} md={4} key={res._id}>
//             <Card
//               variant="outlined"
//               onClick={() => navigate(`/resources/${type}/${res._id}`)}
//               sx={{
//                 cursor: "pointer",
//                 "&:hover": { boxShadow: 3, backgroundColor: "#f9f9f9" },
//               }}
//             >
//               <CardContent>
//                 {fields.map((field) => {
//                   const value = res[field.name];

//                   if (field.name === "status") {
//                     return (
//                       <Chip
//                         key={field.name}
//                         label={value}
//                         color={
//                           value === "available"
//                             ? "success"
//                             : value === "in shelf"
//                             ? "warning"
//                             : value === "demolished"
//                             ? "error"
//                             : "default"
//                         }
//                         sx={{ mb: 1 }}
//                       />
//                     );
//                   }

//                   if (field.name === "link" && value) {
//                     return (
//                       <Typography key={field.name} variant="body2">
//                         <strong>{field.label}:</strong>{" "}
//                         <MuiLink
//                           href={value}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           Open
//                         </MuiLink>
//                       </Typography>
//                     );
//                   }

//                   return (
//                     <Typography key={field.name} variant="body2">
//                       <strong>{field.label}:</strong> {value || "N/A"}
//                     </Typography>
//                   );
//                 })}
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// };

// export default ResourceViewer;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Alert,
//   Card,
//   CardContent,
//   Chip,
//   Link as MuiLink,
//   Grid,
// } from "@mui/material";
// import { resourceFields } from "../config/resourceFieldConfig";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const navigate = useNavigate();
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fields = resourceFields[type] || [];

//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
//         setResources(res.data.resources || []);
//       } catch (err) {
//         console.error("API error:", err);
//         setError("Failed to fetch resources.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, [type]);

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom mt={4}>
//         Viewing: {type?.replace("-", " ").toUpperCase()}
//       </Typography>

//       {loading && <CircularProgress />}
//       {error && <Alert severity="error">{error}</Alert>}

//       {!loading && !error && resources.length === 0 && (
//         <Typography>No resources found.</Typography>
//       )}

//       <Grid container spacing={2} mt={2}>
//         {resources.map((res) => (
//           <Grid item xs={12} sm={6} md={4} key={res._id}>
//             <Card
//               variant="outlined"
//               onClick={() => navigate(`/resources/${type}/${res._id}`)}
//               sx={{
//                 cursor: "pointer",
//                 "&:hover": { boxShadow: 3, backgroundColor: "#f9f9f9" },
//               }}
//             >
//               <CardContent>
//                 {fields.map((field) => {
//                   const value = res[field.name];

//                   if (field.name === "status") {
//                     return (
//                       <Chip
//                         key={field.name}
//                         label={value}
//                         color={
//                           value === "available"
//                             ? "success"
//                             : value === "in shelf"
//                             ? "warning"
//                             : value === "demolished"
//                             ? "error"
//                             : "default"
//                         }
//                         sx={{ mb: 1 }}
//                       />
//                     );
//                   }

//                   if (field.name === "link" && value) {
//                     return (
//                       <Typography key={field.name} variant="body2">
//                         <strong>{field.label}:</strong>{" "}
//                         <MuiLink
//                           href={value}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           onClick={(e) => e.stopPropagation()} // Prevent card click navigation
//                         >
//                           Open
//                         </MuiLink>
//                       </Typography>
//                     );
//                   }

//                   return (
//                     <Typography key={field.name} variant="body2">
//                       <strong>{field.label}:</strong> {value || "N/A"}
//                     </Typography>
//                   );
//                 })}
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// };

// export default ResourceViewer;

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Alert,
//   Card,
//   CardContent,
//   Chip,
//   Link as MuiLink,
//   Grid,
// } from "@mui/material";
// import { resourceFields } from "../config/resourceFieldConfig";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// const ResourceViewer = () => {
//   const { type } = useParams();
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fields = resourceFields[type] || [];

//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
//         setResources(res.data.resources || []);
//       } catch (err) {
//         console.error("API error:", err);
//         setError("Failed to fetch resources.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, [type]);

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom mt={4}>
//         Viewing: {type?.replace("-", " ").toUpperCase()}
//       </Typography>

//       {loading && <CircularProgress />}
//       {error && <Alert severity="error">{error}</Alert>}

//       {!loading && !error && resources.length === 0 && (
//         <Typography>No resources found.</Typography>
//       )}

//       <Grid container spacing={2} mt={2}>
//         {resources.map((res, idx) => (
//           <Grid item xs={12} sm={6} md={4} key={idx}>
//             <Card variant="outlined">
//               <CardContent>
//                 {fields.map((field) => {
//                   const value = res[field.name];
//                   if (field.name === "status") {
//                     return (
//                       <Chip
//                         key={field.name}
//                         label={value}
//                         color={
//                           value === "available"
//                             ? "success"
//                             : value === "in shelf"
//                             ? "warning"
//                             : value === "demolished"
//                             ? "error"
//                             : "default"
//                         }
//                         sx={{ mb: 1 }}
//                       />
//                     );
//                   }

//                   if (field.name === "link" && value) {
//                     return (
//                       <Typography key={field.name} variant="body2">
//                         <strong>{field.label}:</strong>{" "}
//                         <MuiLink href={value} target="_blank" rel="noopener">
//                           Open
//                         </MuiLink>
//                       </Typography>
//                     );
//                   }

//                   return (
//                     <Typography key={field.name} variant="body2">
//                       <strong>{field.label}:</strong> {value || "N/A"}
//                     </Typography>
//                   );
//                 })}
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// };

// export default ResourceViewer;

// // import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// // import axios from 'axios';
// // import {
// //   Container,
// //   Typography,
// //   CircularProgress,
// //   Alert,
// //   Grid,
// //   Card,
// //   CardContent,
// //   Chip,
// //   Button,
// // } from '@mui/material';

// // const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// // const ResourceViewer = () => {
// //   const { type } = useParams();
// //   const [resources, setResources] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');

// //   useEffect(() => {
// //     const fetchResources = async () => {
// //       try {
// //         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
// //         setResources(res.data.resources || []);
// //       } catch (err) {
// //         console.error('API error:', err);
// //         setError('Failed to fetch resources.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchResources();
// //   }, [type]);

// //   const renderStatusChip = (status) => {
// //     let color = 'default';
// //     if (status === 'available') color = 'success';
// //     else if (status === 'inshelf') color = 'warning';
// //     else if (status === 'demolished') color = 'error';

// //     return <Chip label={status} color={color} sx={{ mt: 1 }} />;
// //   };

// //   return (
// //     <Container>
// //       <Typography variant="h4" gutterBottom mt={3}>
// //         Viewing: {type?.replace('-', ' ').toUpperCase()}
// //       </Typography>

// //       {loading && <CircularProgress />}

// //       {error && <Alert severity="error">{error}</Alert>}

// //       {!loading && !error && (
// //         <Grid container spacing={2}>
// //           {resources.length === 0 ? (
// //             <Typography>No resources found.</Typography>
// //           ) : (
// //             resources.map((res) => (
// //               <Grid item xs={12} sm={6} md={4} key={res._id}>
// //                 <Card sx={{ backgroundColor: '#f5f5f5' }}>
// //                   <CardContent>
// //                     <Typography variant="h6">{res.subject} ({res.course})</Typography>
// //                     <Typography>Year: {res.year}</Typography>
// //                     <Typography>Semester: {res.semester}</Typography>
// //                     <Typography>Accession No: {res.accessionNumber}</Typography>
                    
// //                     {renderStatusChip(res.status)}

// //                     <div style={{ marginTop: '1rem' }}>
// //                       <Button
// //                         variant="outlined"
// //                         color="primary"
// //                         href={res.link}
// //                         target="_blank"
// //                       >
// //                         Open Link
// //                       </Button>
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               </Grid>
// //             ))
// //           )}
// //         </Grid>
// //       )}
// //     </Container>
// //   );
// // };

// // export default ResourceViewer;


// // import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// // import axios from 'axios';
// // import { Container, Typography, CircularProgress, Alert } from '@mui/material';

// // const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// // const ResourceViewer = () => {
// //   const { type } = useParams();
// //   const [resources, setResources] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');

// //   useEffect(() => {
// //     console.log("Fetching resources for type:", type);
// //     const fetchResources = async () => {
// //       try {
// //         const res = await axios.get(`${BACKEND_URL}/api/resources/${type}`);
// //         console.log("Fetched data:", res.data);
// //         setResources(res.data);
// //       } catch (err) {
// //         console.error("API error:", err);
// //         setError('Failed to fetch resources.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchResources();
// //   }, [type]);

// //   return (
// //     <Container>
// //       <Typography variant="h4" gutterBottom mt={3}>
// //         Viewing: {type?.replace('-', ' ').toUpperCase()}
// //       </Typography>

// //       {loading && <CircularProgress />}

// //       {error && <Alert severity="error">{error}</Alert>}

// //       {!loading && !error && (
// //         <div>
// //           {resources.length === 0 ? (
// //             <Typography>No resources found.</Typography>
// //           ) : (
// //             resources.map((res, index) => (
// //               <pre key={index} style={{ backgroundColor: '#eee', padding: '1rem', marginBottom: '1rem' }}>
// //                 {JSON.stringify(res, null, 2)}
// //               </pre>
// //             ))
// //           )}
// //         </div>
// //       )}
// //     </Container>
// //   );
// // };

// // export default ResourceViewer;
