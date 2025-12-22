const ClientTable = ({ clients = [] }) => (
  <div className="bg-brand-card rounded-3xl p-5 shadow-card">
    <div className="flex items-center justify-between mb-4">
      <p className="font-semibold text-brand-ink">Client List</p>
      <span className="text-sm text-brand-muted">{clients.length} clients</span>
    </div>
    <div className="divide-y divide-brand-border">
      {clients.map((client) => (
        <div key={client._id} className="py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-brand-ink">
              {client.firstName} {client.lastName}
            </p>
            <p className="text-sm text-brand-muted">{client.email}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600">
            Active
          </span>
        </div>
      ))}
      {!clients.length && (
        <p className="text-sm text-brand-muted py-6 text-center">
          No clients yet. Start adding clients to see them here.
        </p>
      )}
    </div>
  </div>
);

export default ClientTable;
