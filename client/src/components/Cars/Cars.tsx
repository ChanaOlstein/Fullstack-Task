import { useEffect, useState } from "react";
import type { Car } from "../types/types";
import "./Cars.css";

const API = "http://localhost:3000";

//Convert a string input coming from <input type="number"> into a number or null.
const toNumberOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

//Renders a CRUD UI for EV cars backed by a REST API.
const Cars = () => {
  // Server state: list of cars
  const [cars, setCars] = useState<Car[]>([]);
  // UI state: async indicator and top-level error banner
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Local form state for "Add" flow
  const [addForm, setAddForm] = useState({
    Car_name: "",
    Efficiency: "",
    Fast_charge: "",
    Price: "",
    Range: "",
    Top_speed: "",
    Acceleration: "",
  });

  // Inline edit state: which row is being edited + its draft values
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    Car_name: "",
    Efficiency: "",
    Fast_charge: "",
    Price: "",
    Range: "",
    Top_speed: "",
    Acceleration: "",
  });

  //Fetch cars from API on mount.
  const loadCars = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${API}/cars`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Car[] = await res.json();
      setCars(data);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadCars();
  }, []);

  //Generic change handler for Add form fields.
  const handleAddChange =
    (key: keyof typeof addForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  //POST to API and prepend the created record to UI state
  const addCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const Car_name = addForm.Car_name.trim();
    if (!Car_name) {
      setErr("Car_name is required");
      return;
    }
    try {
      setErr(null);
      const payload = {
        Car_name,
        Efficiency: toNumberOrNull(addForm.Efficiency),
        Fast_charge: toNumberOrNull(addForm.Fast_charge),
        Price: toNumberOrNull(addForm.Price),
        Range: toNumberOrNull(addForm.Range),
        Top_speed: toNumberOrNull(addForm.Top_speed),
        Acceleration: toNumberOrNull(addForm.Acceleration),
      };
      const res = await fetch(`${API}/cars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `${res.status}`);
      // Optimistically add the newly created car to the top of the table
      setCars((prev) => [data.car as Car, ...prev]);
      // Reset the Add form
      setAddForm({
        Car_name: "",
        Efficiency: "",
        Fast_charge: "",
        Price: "",
        Range: "",
        Top_speed: "",
        Acceleration: "",
      });
    } catch (e: any) {
      setErr(e?.message || "Network error");
    }
  };

  //Enter inline-edit mode for a given row by id. Copies the current row values into `editForm` as strings for inputs.
  const startEdit = (car: Car) => {
    setEditingId(car.id);
    setEditForm({
      Car_name: car.Car_name ?? "",
      Efficiency: car.Efficiency != null ? String(car.Efficiency) : "",
      Fast_charge: car.Fast_charge != null ? String(car.Fast_charge) : "",
      Price: car.Price != null ? String(car.Price) : "",
      Range: car.Range != null ? String(car.Range) : "",
      Top_speed: car.Top_speed != null ? String(car.Top_speed) : "",
      Acceleration: car.Acceleration != null ? String(car.Acceleration) : "",
    });
  };

  //Generic change handler for Edit form fields (same idea as Add form).
  const handleEditChange =
    (key: keyof typeof editForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  //Persist inline edit: Build payload (trim strings, normalize numeric fields) PUT to API
  //Replace the updated row in local state Exit edit mode
  const saveEdit = async (id: number) => {
    try {
      setErr(null);
      const payload = {
        Car_name: editForm.Car_name.trim(),
        Efficiency: toNumberOrNull(editForm.Efficiency),
        Fast_charge: toNumberOrNull(editForm.Fast_charge),
        Price: toNumberOrNull(editForm.Price),
        Range: toNumberOrNull(editForm.Range),
        Top_speed: toNumberOrNull(editForm.Top_speed),
        Acceleration: toNumberOrNull(editForm.Acceleration),
      };
      const res = await fetch(`${API}/cars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      // Update the edited item in-place
      setCars((prev) => prev.map((c) => (c.id === id ? (data.car as Car) : c)));
      setEditingId(null);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    }
  };

  // Exit edit mode without saving changes
  const cancelEdit = () => setEditingId(null);

  //Delete a row: Ask for user confirmation DELETE to API Remove from local state on success
  const deleteCar = async (id: number) => {
    if (!confirm("delete?")) return;
    try {
      setErr(null);
      const res = await fetch(`${API}/cars/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setCars((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setErr(e?.message || "Network error");
    }
  };

  return (
    <div className="cars">
      <h2 className="cars__title">EV Cars</h2>

      {/* Add form: minimal validation on required name; numeric fields optional */}
      <form onSubmit={addCar} className="cars__form">
        <input
          placeholder="Car_name *"
          value={addForm.Car_name}
          onChange={handleAddChange("Car_name")}
          required
        />
        <input
          type="number"
          placeholder="Efficiency"
          value={addForm.Efficiency}
          onChange={handleAddChange("Efficiency")}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Fast_charge"
          value={addForm.Fast_charge}
          onChange={handleAddChange("Fast_charge")}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={addForm.Price}
          onChange={handleAddChange("Price")}
        />
        <input
          type="number"
          placeholder="Range"
          value={addForm.Range}
          onChange={handleAddChange("Range")}
        />
        <input
          type="number"
          placeholder="Top_speed"
          value={addForm.Top_speed}
          onChange={handleAddChange("Top_speed")}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Acceleration"
          value={addForm.Acceleration}
          onChange={handleAddChange("Acceleration")}
        />
        <button type="submit" className="btn btn--primary">
          Add
        </button>
      </form>

      {/* Error & loading banners */}
      {err && <div className="banner banner--error">{err}</div>}
      {loading && <div className="banner banner--loading">Loading…</div>}

      {/* Simple table with inline edit rendering logic per row */}
      <div className="table-wrap">
        <table border={1} cellPadding={6} className="table">
          <thead>
            <tr>
              {[
                "id",
                "Car_name",
                "Efficiency",
                "Fast_charge",
                "Price",
                "Range",
                "Top_speed",
                "Acceleration",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.Car_name}
                        onChange={handleEditChange("Car_name")}
                        required
                      />
                    ) : (
                      c.Car_name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.Efficiency}
                        onChange={handleEditChange("Efficiency")}
                      />
                    ) : (
                      c.Efficiency ?? ""
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.Fast_charge}
                        onChange={handleEditChange("Fast_charge")}
                      />
                    ) : (
                      c.Fast_charge ?? ""
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.Price}
                        onChange={handleEditChange("Price")}
                      />
                    ) : (
                      c.Price ?? ""
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.Range}
                        onChange={handleEditChange("Range")}
                      />
                    ) : (
                      c.Range ?? ""
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.Top_speed}
                        onChange={handleEditChange("Top_speed")}
                      />
                    ) : (
                      c.Top_speed ?? ""
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.Acceleration}
                        onChange={handleEditChange("Acceleration")}
                      />
                    ) : (
                      c.Acceleration ?? ""
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn--primary"
                          onClick={() => saveEdit(c.id)}
                        >
                          Save
                        </button>{" "}
                        <button
                          className="btn btn--ghost"
                          onClick={cancelEdit}
                          type="button"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn" onClick={() => startEdit(c)}>
                          Edit
                        </button>{" "}
                        <button
                          className="btn btn--danger"
                          onClick={() => deleteCar(c.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && cars.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center" }}>
                  no records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cars;
