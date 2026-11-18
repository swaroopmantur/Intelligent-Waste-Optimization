
import { useEffect, useState } from "react";
import "./App.css";
import MapView from "./MapView";

const API = import.meta.env.VITE_API_URL;

function App() {
    const [showBinForm, setShowBinForm] = useState(false);
    const [editingBin, setEditingBin] = useState(null);
    const [showTruckForm, setShowTruckForm] = useState(false);
const [editingTruck, setEditingTruck] = useState(null);

const [truckForm, setTruckForm] = useState({
  registrationNumber: "",
  driverName: "",
  capacityKg: 1000,
  currentLoadKg: 0
});

const [binForm, setBinForm] = useState({
    binId: "",
    location: "",
    capacity: 100,
    fillLevel: 0,
    latitude: "",
    longitude: "",
    wasteType:"General"
});
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [bins, setBins] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [route, setRoute] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCollection, setActiveCollection] = useState(null);
const [collectionHistory, setCollectionHistory] = useState([]);



    const loadData = async () => {
        try {
            
           

            const [binResponse, truckResponse] = await Promise.all([
                fetch(`${API}/bins`),
                fetch(`${API}/trucks`)
            ]);

            if (!binResponse.ok || !truckResponse.ok) {
                throw new Error("Unable to load project data");
            }

            const binResult = await binResponse.json();
            const truckResult = await truckResponse.json();

            setBins(binResult.bins || binResult.data || []);
            setTrucks(truckResult.data || truckResult.trucks || []);
            await loadCollectionHistory();
            
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleAddBin = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(`${API}/bins`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                binId: binForm.binId,
                location: {
                    address: binForm.location,
                    latitude: Number(binForm.latitude),
                    longitude: Number(binForm.longitude)
                },
                capacity: Number(binForm.capacity),
                fillLevel: Number(binForm.fillLevel), 
                wasteType: binForm.wasteType
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to add bin");
        }

        setShowBinForm(false);

        setBinForm({
            binId: "",
            location: "",
            capacity: 100,
            fillLevel: 0,
            latitude: "",
            longitude: ""
        });

        await loadData();
        setError("");

    } catch (err) {
        setError(err.message);
    }
};
const handleEditBin = (bin) => {
    setEditingBin(bin);

    setBinForm({
        binId: bin.binId,
        location: bin.location?.address || "",
        latitude: bin.location?.latitude || "",
        longitude: bin.location?.longitude || "",
        capacity: bin.capacity,
        fillLevel: bin.fillLevel,
        wasteType: bin.wasteType === "general"
    ? "General"
    : bin.wasteType
    });

    setShowBinForm(true);
};

const handleUpdateBin = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(
            `${API}/bins/${editingBin._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    binId: binForm.binId,
                    location: {
                        address: binForm.location,
                        latitude: Number(binForm.latitude),
                        longitude: Number(binForm.longitude)
                    },
                    capacity: Number(binForm.capacity),
                    fillLevel: Number(binForm.fillLevel),
                    wasteType: binForm.wasteType
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to update bin");
        }

        setShowBinForm(false);
        setEditingBin(null);
        setError("");

        await loadData();

    } catch (err) {
        setError(err.message);
    }
};
const handleDeleteBin = async (bin) => {
    const confirmDelete = window.confirm(
        `Are you sure you want to delete bin ${bin.binId}?`
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API}/bins/${bin._id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to delete bin");
        }

        setError("");
        await loadData();

    } catch (err) {
        setError(err.message);
    }
};


const handleEditTruck = (truck) => {
  setEditingTruck(truck);

  setTruckForm({
    registrationNumber: truck.registrationNumber || "",
    driverName: truck.driverName || "",
    capacityKg: truck.capacityKg || 1000,
    currentLoadKg: truck.currentLoadKg || 0
  });

  setShowTruckForm(true);
};



const handleSaveTruck = async (e) => {
  e.preventDefault();

  try {
    const isEditing = editingTruck !== null;

    const payload = {
      registrationNumber: truckForm.registrationNumber,
      driverName: truckForm.driverName,
      capacityKg: Number(truckForm.capacityKg),
      currentLoadKg: Number(truckForm.currentLoadKg),
      truckId: isEditing ? editingTruck.truckId : `TRUCK${Date.now()}`,
      location: isEditing
        ? editingTruck.location
        : {
            address: "Siddaganga Institute of Technology, Tumkur",
            latitude: 13.3370,
            longitude: 77.1173
          }
    };

    const response = await fetch(
      isEditing
        ? `${API}/trucks/${editingTruck._id}`
        : `${API}/trucks`,
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Truck operation failed");
    }

    setShowTruckForm(false);
    setEditingTruck(null);
    setError("");

    await loadData();

  } catch (err) {
    setError(err.message);
  }
};





const handleDeleteTruck = async (truck) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${truck.truckId}?`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `${API}/trucks/${truck._id}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to delete truck");
    }

    alert("Truck deleted successfully!");
    await loadData();

  } catch (err) {
    setError(err.message);
  }
};

   useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    
}, []);

    const averageFill = bins.length
        ? Math.round(
            bins.reduce((sum, bin) => sum + bin.fillLevel, 0) / bins.length
        )
        : 0;

    const criticalBins = bins.filter(bin => bin.fillLevel >= 80).length;
    const availableTrucks = trucks.filter(
        truck => truck.status === "available"
    ).length;

    const getPriority = (fill) => {
        if (fill >= 80) return "Critical";
        if (fill >= 60) return "High";
        if (fill >= 30) return "Medium";
        return "Low";
    };

   
const predictBin = async (bin) => {
    try {
        setPrediction(null);
        setError("");

        const response = await fetch(
            `${API}/bins/${bin._id}/predict`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Prediction failed");
        }

        setPrediction({
            binId: result.binId,
            ...result.prediction
        });

    } catch (err) {
        setError(err.message);
    }
};


    const optimizeRoute = async (truck) => {
        try {
            setRoute(null);
            setError("");

            const response = await fetch(`${API}/routes/optimize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ truckId: truck._id })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Route optimization failed");
            }

            setRoute(result.route);
        } catch (err) {
            setError(err.message);
        }
    };
    const startCollection = async (currentRoute) => {
    try {
        if (!currentRoute) {
    setError("Please optimize a route first.");
    return;
}
      console.log("START COLLECTION ROUTE:", currentRoute);
console.log("TRUCK ID:", currentRoute?.truckMongoId);
console.log("COLLECTION BINS:", currentRoute?.stops);
        const response = await fetch(`${API}/collections/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                truckId: currentRoute.truckMongoId,
                bins: currentRoute.stops.map(stop => ({
    binMongoId: stop.binMongoId,
    binId: stop.binId,
    estimatedWeightKg: stop.estimatedWeightKg
}))
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not start collection");
        }

        setActiveCollection(result.collection || result);
        setError("");
        await loadData();
    } catch (err) {
        setError(err.message);
    }
};


const markBinCollected = async (binId) => {
    try {
        const response = await fetch(
            `${API}/collections/${activeCollection._id}/bins/${binId}/collect`,
            { method: "PATCH" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Collection failed");
        }

        setActiveCollection(result.collection);

        if (result.collection.status === "completed") {
            setActiveCollection(null);
        }

        await loadData();
        await loadCollectionHistory();

        setError("");
    } catch (err) {
        setError(err.message);
    }
};



async function loadCollectionHistory() {
    try {
        const response = await fetch(`${API}/collections`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error("Could not load collection history");
        }

        const collections = result.collections || [];

        setCollectionHistory(collections);

        // Use only the newest collection record. Older test records may still
        // be marked in_progress and must not reactivate after a newer one completes.
        const newestCollection = [...collections].sort(
            (a, b) => new Date(b.startedAt || b.createdAt) - new Date(a.startedAt || a.createdAt)
        )[0];

        setActiveCollection(
            newestCollection?.status === "in_progress" ? newestCollection : null
        );

    } catch (err) {
        setError(err.message);
    }
}


    const navItems = ["Dashboard", "Bins", "Trucks", "Routes"];

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">♻</div>
                    <div>
                        <h2>WasteWise</h2>
                        <span>Smart Management</span>
                    </div>
                </div>

                <div className="nav-label">MAIN MENU</div>

                <nav>
                    {navItems.map(item => (
                        <button
                            key={item}
                            className={activeTab === item ? "nav-item active" : "nav-item"}
                            onClick={() => setActiveTab(item)}
                        >
                            <span>
                                {item === "Dashboard" ? "▦" :
                                 item === "Bins" ? "▤" :
                                 item === "Trucks" ? "▣" : "⌖"}
                            </span>
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="system-status">
                        <span className="status-dot"></span>
                        Backend connected
                    </div>
                    <p>Intelligent Waste Collection System</p>
                </div>
            </aside>

            <main className="main">
                <header className="topbar">
                    <div>
                        <h1>{activeTab}</h1>
                        <p>Monitor and manage your waste collection operations.</p>
                    </div>

                    <button
                        className="refresh-btn"
                        onClick={() => {
                            setError("");
                            loadData();
                        }}
                    >
                        ↻ Refresh Data
                    </button>
                </header>

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Loading project data...</div>
                ) : (
                    <>
                        {activeTab === "Dashboard" && (
                            <>
                                <section className="welcome">
                                    <div>
                                   <span className="eyebrow">OVERVIEW</span>
                                        <h2>Welcome to WasteWise</h2>
                                        <p>
                                            Your smart waste collection operations at a glance.
                                        </p>
                                    </div>
                                    <div className="welcome-icon">🌱</div>
                                </section>

                                <section className="stats-grid">
                                    <StatCard
                                        title="Total Bins"
                                        value={bins.length}
                                        icon="▤"
                                        color="blue"
                                    />
                                    <StatCard
                                        title="Critical Bins"
                                        value={criticalBins}
                                        icon="⚠"
                                        color="red"
                                    />
                                    <StatCard
                                        title="Average Fill Level"
                                        value={`${averageFill}%`}
                                        icon="◉"
                                        color="orange"
                                    />
                                    <StatCard
                                        title="Available Trucks"
                                        value={availableTrucks}
                                        icon="▣"
                                        color="green"
                                    />
                                </section>
                                 
<section className="alerts-panel">
    <div className="panel-heading">
        <div>
            <h3>Smart Collection Alerts</h3>
            <p>Bins that need attention</p>
        </div>
        <span className="alert-count">
            {bins.filter(bin => Number(bin.fillLevel) >= 80).length +
                (prediction?.collection_recommended &&
                Number(prediction.predicted_fill_after_6_hours) >= 80 &&
                !bins.some(bin =>
                    bin.binId === prediction.binId &&
                    Number(bin.fillLevel) >= 80
                ) ? 1 : 0)}
        </span>
    </div>

    {bins.filter(bin => Number(bin.fillLevel) >= 80).length === 0 &&
    !prediction?.collection_recommended ? (
        <p className="no-alerts">All bins are currently below the critical level.</p>
    ) : (
        <div className="alerts-list">
            {bins
                .filter(bin => Number(bin.fillLevel) >= 80)
                .map(bin => (
                    <div className="dashboard-alert critical-alert" key={bin._id}>
                        <div>
                            <strong>{bin.binId} — Critical</strong>
                            <p>{bin.location?.address || "Location unavailable"}</p>
                        </div>
                        <span>{bin.fillLevel}% full</span>
                    </div>
                ))}

            {prediction?.collection_recommended &&
            Number(prediction.predicted_fill_after_6_hours) >= 80 &&
            !bins.some(bin =>
                bin.binId === prediction.binId &&
                Number(bin.fillLevel) >= 80
            ) && (
                <div className="dashboard-alert predicted-alert">
                    <div>
                        <strong>{prediction.binId} — Upcoming collection</strong>
                        <p>Predicted to reach {prediction.predicted_fill_after_6_hours}% in 6 hours</p>
                    </div>
                    <span>Recommended</span>
                </div>
            )}
        </div>
    )}
</section>

                                <section className="content-grid">
                                    <div className="panel">
                                        <div className="panel-heading">
                                            <div>
                                                <h3>Bin Monitoring</h3>
                                                <p>Current waste fill levels</p>
                                            </div>
                                            <button onClick={() => setActiveTab("Bins")}>
                                                View all →
                                            </button>
                                        </div>

                                        <BinTable
                                            bins={bins.slice(0, 5)}
                                            onPredict={predictBin}
                                            getPriority={getPriority}
                                            onEditBin={handleEditBin}
                                            onDeleteBin={handleDeleteBin}
                                        />
                                    </div>

                                    <div className="panel">
                                        <div className="panel-heading">
                                            <div>
                                                <h3>Fleet Overview</h3>
                                                <p>Truck availability</p>
                                            </div>
                                            <button onClick={() => setActiveTab("Trucks")}>
                                                View all →
                                            </button>
                                        </div>

                                        {trucks.slice(0, 5).map(truck => (
                                            <div className="truck-row" key={truck._id}>
                                                <div className="truck-icon">🚛</div>
                                                <div className="truck-info">
                                                    <strong>{truck.truckId}</strong>
                                                    <span>{truck.driverName}</span>
                                                </div>
                                                <Status value={truck.status} />
                                            </div>
                                        ))}

                                        {trucks.length === 0 && (
                                            <p className="empty">No trucks registered.</p>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab === "Bins" && (
                            <section className="panel full-panel">
                                <div className="panel-heading">
    <div>
        <h3>Smart Bin Management</h3>
        <p>Monitor bin fill levels and predict overflow.</p>
    </div>

    <button onClick={() => setShowBinForm(true)}>
        + Add Bin
    </button>
</div>
{showBinForm && (
    <form
    onSubmit={editingBin ? handleUpdateBin : handleAddBin}
    className="bin-form"
>
        <h3>{editingBin ? "Edit Waste Bin" : "Add New Waste Bin"}</h3>

        <input
            placeholder="Bin ID"
            value={binForm.binId}
            onChange={e => setBinForm({
                ...binForm,
                binId: e.target.value
            })}
            required
        />
        <select
    value={binForm.wasteType}
    onChange={e => setBinForm({
        ...binForm,
        wasteType: e.target.value
    })}
    required
>
    <option value="General">General</option>
    <option value="Organic">Organic</option>
    <option value="Recyclable">Recyclable</option>
</select>

        <input
            placeholder="Location Address"
            value={binForm.location}
            onChange={e => setBinForm({
                ...binForm,
                location: e.target.value
            })}
            required
        />

        <input
            type="number"
            placeholder="Latitude"
            value={binForm.latitude}
            onChange={e => setBinForm({
                ...binForm,
                latitude: e.target.value
            })}
            required
        />

        <input
            type="number"
            placeholder="Longitude"
            value={binForm.longitude}
            onChange={e => setBinForm({
                ...binForm,
                longitude: e.target.value
            })}
            required
        />

        <input
            type="number"
            placeholder="Capacity"
            value={binForm.capacity}
            onChange={e => setBinForm({
                ...binForm,
                capacity: e.target.value
            })}
            required
        />

        <input
            type="number"
            placeholder="Fill Level"
            min="0"
            max="100"
            value={binForm.fillLevel}
            onChange={e => setBinForm({
                ...binForm,
                fillLevel: e.target.value
            })}
            required
        />

        <button type="submit">Save Bin</button>

        <button
            type="button"
            onClick={() => setShowBinForm(false)}
        >
            Cancel
        </button>
    </form>
)}

                                <BinTable
                                    bins={bins}
                                    onPredict={predictBin}
                                    getPriority={getPriority}
                                    onEditBin={handleEditBin}
                                    onDeleteBin={handleDeleteBin}
                                />
                            </section>
                        )}

                        {activeTab === "Trucks" && (
                            <section className="panel full-panel">
                               <div className="panel-heading">
  <div>
    <h3>Truck Fleet</h3>
    <p>Registered vehicles and availability.</p>
  </div>

  <button onClick={() => {
    setEditingTruck(null);
    setTruckForm({
      registrationNumber: "",
      driverName: "",
      capacityKg: 1000,
      currentLoadKg: 0
    });
    setShowTruckForm(true);
  }}>
    + Add Truck
  </button>
</div>

{showTruckForm && (
  <form className="bin-form" onSubmit={handleSaveTruck}>
    <h3>Edit Truck</h3>

    <input
      type="text"
      placeholder="Registration Number"
      value={truckForm.registrationNumber}
      onChange={(e) =>
        setTruckForm({
          ...truckForm,
          registrationNumber: e.target.value
        })
      }
      required
    />

    <input
      type="text"
      placeholder="Driver Name"
      value={truckForm.driverName}
      onChange={(e) =>
        setTruckForm({
          ...truckForm,
          driverName: e.target.value
        })
      }
      required
    />

    <input
      type="number"
      placeholder="Capacity (kg)"
      value={truckForm.capacityKg}
      onChange={(e) =>
        setTruckForm({
          ...truckForm,
          capacityKg: e.target.value
        })
      }
      min="1"
      required
    />

    <input
      type="number"
      placeholder="Current Load (kg)"
      value={truckForm.currentLoadKg}
      onChange={(e) =>
        setTruckForm({
          ...truckForm,
          currentLoadKg: e.target.value
        })
      }
      min="0"
      required
    />

    <button type="submit">Save Changes</button>

    <button
      type="button"
      onClick={() => {
        setShowTruckForm(false);
        setEditingTruck(null);
      }}
    >
      Cancel
    </button>
  </form>
)}


                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Truck ID</th>
                                                <th>Registration</th>
                                                <th>Driver</th>
                                                <th>Capacity</th>
                                                <th>Current Load</th>
                                                <th>Status</th>
                                                <th>Actions</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trucks.map(truck => (
                                                <tr key={truck._id}>
                                                    <td>{truck.truckId}</td>
                                                    <td>{truck.registrationNumber}</td>
                                                    <td>{truck.driverName}</td>
                                                    <td>{truck.capacityKg} kg</td>
                                                    <td>{truck.currentLoadKg} kg</td>
                                                    <td><Status value={truck.status} /></td>

<td>
  <button onClick={() => handleEditTruck(truck)}>
    Edit
  </button>

  <button onClick={() => handleDeleteTruck(truck)}>
    Delete
  </button>
</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {trucks.length === 0 && (
                                    <p className="empty">No trucks registered.</p>
                                )}
                            </section>
                        )}

                        {activeTab === "Routes" && (
                            <section className="panel full-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h3>Route Optimization</h3>
                                        <p>Select an available truck to generate its collection route.</p>
                                    </div>
                                </div>

                                {!activeCollection && trucks.filter(t => t.status === "available").map(truck => (
                                    <div className="route-truck" key={truck._id}>
                                        <div>
                                            <strong>{truck.truckId}</strong>
                                            <p>{truck.driverName} · {truck.capacityKg} kg capacity</p>
                                        </div>
                                        <button
                                            className="primary-btn"
                                            onClick={() => optimizeRoute(truck)}
                                        >
                                            Optimize Route
                                        </button>
                                    </div>
                                ))}

                                {trucks.length === 0 && (
                                    <p className="empty">Register a truck to optimize a route.</p>
                                )}

                                {!activeCollection && trucks.length > 0 &&
                                    trucks.every(t => t.status !== "available") && (
                                        <p className="empty">
                                            No available truck. Complete the active collection to release the truck.
                                        </p>
                                    )}

                                {route && (
                                    <div className="route-result">
                                        <h3>Optimized Collection Route</h3>
                                        <div className="route-metrics">
                                            <div>
                                                <strong>{route.totalStops}</strong>
                                                <span>Collection Stops</span>
                                            </div>
                                            <div>
                                                <strong>{route.totalDistanceKm} km</strong>
                                                <span>Total Distance</span>
                                            </div>
                                            <div>
                                                <strong>{route.estimatedLoadKg} kg</strong>
                                                <span>Estimated Load</span>
                                            </div>
                                            <div>
                                                <strong>{route.remainingCapacityKg} kg</strong>
                                                <span>Remaining Capacity</span>
                                            </div>
                                        </div>

                                        {route.stops.map((stop, index) => (
                                            <div className="stop-row" key={stop.binMongoId}>
                                                <span className="stop-number">{index + 1}</span>
                                                <div>
                                                    <strong>{stop.binId}</strong>
                                                    <p>{stop.address}</p>
                                                </div>
                                                <span>{stop.distanceFromPreviousKm} km</span>
                                            </div>
                                        ))}
                                        {route && !activeCollection && (
  <div className="collection-actions">
    <button
      className="primary-btn"
      onClick={() => startCollection(route)}
    >
      Start Collection
    </button>
  </div>
)}

                                        {route.totalStops === 0 && (
                                            <p className="empty">
                                                No eligible bins could be assigned to this truck.
                                            </p>
                                        )}
                                        <MapView bins={bins} route={route} />
                                    </div>
                                )}

                                {activeCollection && (
                                    <div className="collection-progress">
                                        <h3>Collection in Progress — {activeCollection.truckId}</h3>
                                        <p>Mark each bin as collected after the truck completes that stop.</p>

                                        {(activeCollection.bins || []).map((item) => {
                                            const binMongoId =
                                                typeof item.bin === "object" ? item.bin?._id : item.bin;

                                            return (
                                            <div key={item._id || binMongoId || item.binId} className="stop-row">
                                                <strong>{item.binId}</strong>
                                                {item.status === "collected" ? (
                                                    <span className="status-badge completed">Collected</span>
                                                ) : (
                                                    <button
                                                        className="primary-btn"
                                                        onClick={() => markBinCollected(binMongoId)}
                                                    >
                                                        Mark Collected
                                                    </button>
                                                )}
                                            </div>
                                            );
                                        })}

                                        {(!activeCollection.bins || activeCollection.bins.length === 0) && (
                                            <p className="empty">No bins are listed in this collection.</p>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                       
<div className="name-panel">
  <div className="panel-heading">
    <h3>Collection History</h3>
    <button
      className="primary-btn"
      onClick={loadCollectionHistory}
    >
      Refresh History
    </button>
  </div>

  {collectionHistory.length === 0 ? (
    <p className="empty">No collection history available.</p>
  ) : (
    <div className="history-list">
      {collectionHistory.map((item) => {
        const totalBins = item.bins?.length || 0;
        const collectedBins = item.bins?.filter(
          (bin) => bin.status === "collected"
        ).length || 0;

        return (
          <div className="history-card" key={item._id}>
            <strong>{item.truckId}</strong>
            <p>{new Date(item.startedAt).toLocaleString()}</p>
            <p>{collectedBins}/{totalBins} bins collected</p>
            <p>Estimated waste: {item.totalEstimatedWasteKg} kg</p>
            <span>
              {item.status === "completed" ? "Completed" : "In Progress"}
            </span>
          </div>
        );
      })}
    </div>
  )}
</div>



                        {prediction && (
                            <section className="prediction-panel">
                                <button
                                    className="close-btn"
                                    onClick={() => setPrediction(null)}
                                >×</button>
                                <span className="eyebrow">ML PREDICTION · {prediction.binId}</span>
                                <h3>Bin Fill Forecast</h3>
                                <div className="prediction-grid">
                                    <div>
                                        <strong>{prediction.current_fill}%</strong>
                                        <span>Current fill</span>
                                    </div>
                                    <div>
                                        <strong>{prediction.predicted_fill_after_6_hours}%</strong>
                                        <span>Predicted in 6 hours</span>
                                    </div>
                                    <div>
                                        <strong>
                                            {prediction.estimated_hours_until_full ?? "N/A"}
                                            {prediction.estimated_hours_until_full !== null ? " hrs" : ""}
                                        </strong>
                                        <span>Estimated time until full</span>
                                    </div>
                                </div>

{(prediction.collection_recommended ||
    prediction.predicted_fill_after_6_hours >= 80) && (
    <div className="collection-alert">
        <div className="alert-icon">⚠️</div>
        <div>
            <h4>Collection Recommended</h4>
            <p>
                Bin {prediction.binId} is expected to reach
                {` ${prediction.predicted_fill_after_6_hours}% `}
                within 6 hours.
            </p>
            <span>
                Location: {
                    bins.find(
                        (b) => b.binId === prediction.binId
                    )?.location?.address || "Location unavailable"
                }
            </span>
        </div>
    </div>
)}

                                <Status value={prediction.collection_recommended ? "Critical" : "Normal"} />
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="stat-card">
            <div>
                <p>{title}</p>
                <h2>{value}</h2>
            </div>
            <div className={`stat-icon ${color}`}>{icon}</div>
        </div>
    );
}

function Status({ value }) {
    const normalized = String(value || "unknown").toLowerCase();

    return (
        <span className={`status-badge ${normalized}`}>
            {value}
        </span>
    );
}

function BinTable({ bins, onPredict, getPriority,onEditBin,onDeleteBin }) {
    if (bins.length === 0) {
        return <p className="empty">No bins registered yet.</p>;
    }

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Bin ID</th>
                        <th>Location</th>
                        <th>Fill Level</th>
                        <th>Priority</th>
                        <th>Prediction</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bins.map(bin => (
                        <tr key={bin._id}>
                            <td><strong>{bin.binId}</strong></td>
                            <td>{bin.location?.address}</td>
                            <td>
                                <div className="fill-cell">
                                    <div className="fill-track">
                                        <div
                                            className={`fill-value ${
                                                bin.fillLevel >= 80 ? "danger" :
                                                bin.fillLevel >= 60 ? "warning" : ""
                                            }`}
                                            style={{ width: `${bin.fillLevel}%` }}
                                        />
                                    </div>
                                    <span>{bin.fillLevel}%</span>
                                </div>
                            </td>
                            <td><Status value={getPriority(bin.fillLevel)} /></td>
                            <td>
                                <button
                                    className="predict-btn"
                                    onClick={() => onPredict(bin)}
                                >
                                    Predict
                                </button>
                            </td>
                            <td>
    <button
        className="edit-btn"
        onClick={() => onEditBin(bin)}
    >
        Edit
    </button>
    <button
    type="button"
    className="delete-btn"
    onClick={() => onDeleteBin(bin)}
>
    Delete
</button>
</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;

