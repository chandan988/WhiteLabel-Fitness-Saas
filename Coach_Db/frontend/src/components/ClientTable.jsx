const ClientTable = ({ clients = [] }) => (
  <div className="bg-white rounded-3xl p-5 shadow-card">
    <div className="flex items-center justify-between mb-4">
      <p className="font-semibold text-gray-900">Client List</p>
      <span className="text-sm text-gray-500">{clients.length} clients</span>
    </div>
    <div className="divide-y divide-gray-100">
      {clients.map((client) => (
        <div key={client._id} className="py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">
              {client.firstName} {client.lastName}
            </p>
            <p className="text-sm text-gray-500">{client.email}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600">
            Active
          </span>
        </div>
      ))}
      {!clients.length && (
        <p className="text-sm text-gray-500 py-6 text-center">
          No clients yet. Start adding clients to see them here.
        </p>
      )}
    </div>
  </div>
);

export default ClientTable;
