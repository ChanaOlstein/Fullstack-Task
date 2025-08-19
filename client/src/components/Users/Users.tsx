import { useEffect } from "react";
import type { UsersFormProp } from "../types/types";

const Users = ({ users, setUsers }: UsersFormProp) => {
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users List</h1>
      {users.map((user) => (
        <div key={user.id}>
          <div className="nameAndEmail">
            <span className="fullName">{user.name}</span>
            <span className="email">{user.email}</span>
          </div>
          <span className="id">ID: #{user.id}</span>
        </div>
      ))}
    </div>
  );
};

export default Users;
