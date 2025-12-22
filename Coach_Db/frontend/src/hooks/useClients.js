import { useEffect, useState } from "react";
import { createClient, getClients, revertClientToLead } from "../services/api";

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revertingId, setRevertingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await getClients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const addClient = async (payload) => {
    await createClient(payload);
    await fetchAll();
  };

  const convertBackToLead = async (clientId) => {
    setRevertingId(clientId);
    try {
      await revertClientToLead(clientId);
      setClients((prev) => prev.filter((client) => client._id !== clientId));
    } finally {
      setRevertingId(null);
    }
  };

  return { clients, loading, addClient, convertBackToLead, revertingId };
};
