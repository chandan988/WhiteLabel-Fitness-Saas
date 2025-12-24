const ClientTable = ({
  clients = [],
  selectedClientId,
  onSelectClient,
  onViewAll
}) => (
  <div className="bg-brand-card rounded-3xl p-5 shadow-card">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="font-semibold text-brand-ink">Client List</p>
        <span className="text-sm text-brand-muted">
          {clients.length} clients
        </span>
      </div>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-brand-primary"
        >
          View Individually
        </button>
      )}
    </div>
    <div className="divide-y divide-brand-border max-h-72 overflow-y-auto pr-2">
      {clients.map((client) => (
        <button
          key={client._id}
          type="button"
          onClick={() => onSelectClient?.(client)}
          className={`w-full text-left py-4 flex items-center justify-between transition ${
            selectedClientId === client._id
              ? "bg-brand-surface rounded-2xl px-3"
              : ""
          }`}
        >
          <div>
            <p className="font-semibold text-brand-ink">
              {client.firstName} {client.lastName}
            </p>
            <p className="text-sm text-brand-muted">{client.email}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600">
            Active
          </span>
        </button>
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
