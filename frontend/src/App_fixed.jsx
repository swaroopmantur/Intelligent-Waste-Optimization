
import { useEffect, useState } from "react";
import "./App.css";
import MapView from "./MapView";

const API = "http://localhost:5000/api";

function App() {
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
                                </div>

                                <BinTable
                                    bins={bins}
                                    onPredict={predictBin}
                                    getPriority={getPriority}
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
                                </div>

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

                        <div className="panel">
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
        collectionHistory.map((item, index) => (
            <div className="stop-row" key={item._id || index}>
                <strong>
                    {item.truckId || "Collection"}
                </strong>
                <span>
                    {item.status || "Recorded"}
                </span>
            </div>
        ))
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

function BinTable({ bins, onPredict, getPriority }) {
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;

