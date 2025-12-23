import { useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import { useClients } from "../../hooks/useClients.js";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useOrgPath } from "../../hooks/useOrgPath.js";

const Clients = () => {
  const { clients, loading } = useClients();
  const buildPath = useOrgPath();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => {
      const name = `${client.firstName || ""} ${client.lastName || ""}`.trim();
      const email = client.email || "";
      const phone = client.phone || "";
      return [name, email, phone].some((value) =>
        value.toString().toLowerCase().includes(query)
      );
    });
  }, [clients, searchQuery]);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Clients</h2>
          <p className="text-brand-muted">Manage all of your client profiles</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-brand-muted">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, email, phone"
              className="border border-brand-border rounded-2xl px-3 py-2 text-sm"
            />
          </div>
          <Link to={buildPath("/clients/new")} className="w-48">
            <PrimaryButton>Add New Client</PrimaryButton>
          </Link>
        </div>
      </div>
      <div className="bg-brand-card rounded-3xl shadow-card p-6">
        {loading ? (
          <p>Loading clients...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="pb-4">Client</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Goal</th>
                {/* <th className="pb-4">Actions</th> */}
              </tr>
            </thead>
            <tbody className="text-sm text-brand-ink">
              {filteredClients.map((client) => (
                <tr
                  key={client._id}
                  className="border-t border-brand-border cursor-pointer"
                  onClick={() => navigate(buildPath(`/clients/${client._id}`))}
                >
                  <td className="py-4 font-semibold">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="py-4">{client.email}</td>
                  <td className="py-4">{client.goals?.join(", ") || "-"}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <Link
                        to={buildPath(`/clients/${client._id}`)}
                        className="text-brand-primary font-semibold"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View
                      </Link>
                      {/* <button
                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                        onClick={() => convertBackToLead(client._id)}
                        disabled={revertingId === client._id}
                      >
                        {revertingId === client._id
                          ? "Sending..."
                          : "Convert back to Lead"}
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredClients.length && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-6 text-center text-brand-muted font-medium"
                  >
                    {searchQuery.trim()
                      ? "No clients match your search."
                      : "No clients yet. Convert a lead or add one manually."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Clients;
