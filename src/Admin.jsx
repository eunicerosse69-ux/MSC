import { useState } from "react";

export default function Admin() {
  const [shipments, setShipments] = useState([]);

  const generateTracking = () => {
    const trackingNumber =
      "CS" + Math.floor(100000000 + Math.random() * 900000000);

    const newShipment = {
      trackingNumber,
      status: "Processing",
    };

    const updated = [...shipments, newShipment];

    setShipments(updated);

    localStorage.setItem(
      "shipments",
      JSON.stringify(updated)
    );
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <button onClick={generateTracking}>
        Generate Tracking Number
      </button>

      {shipments.map((item) => (
        <div key={item.trackingNumber}>
          {item.trackingNumber}
        </div>
      ))}
    </div>
  );
}