import { useState } from "react";
import type { User } from "../types/types";

const API = "http://localhost:3000";

const CreateUser = ({
  setUsers,
}: {
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "ok" | "error">(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(err?.error || `HTTP ${res.status}`);
        return;
      }

      const created: { message: string; user: User } = await res.json();
      setStatus("ok");
      setMessage(
        created.message || `created user: ${created.user?.name ?? ""}`
      );
      setName("");
      setEmail("");
      setUsers((prev) => [created.user, ...prev]);
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Network error");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {status === "ok" && <p style={{ color: "green" }}>{message}</p>}
      {status === "error" && <p style={{ color: "crimson" }}>{message}</p>}
    </div>
  );
};

export default CreateUser;
