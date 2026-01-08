import { useEffect, useState } from "react";
import {
  assignPricingPlan,
  createClient,
  getClients,
  revertClientToLead
} from "../services/api";

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

  const assignPlan = async ({ clientId, planId, endDate }) => {
    await assignPricingPlan({ clientId, planId, endDate });
    await fetchAll();
  };

  return {
    clients,
    loading,
    addClient,
    convertBackToLead,
    revertingId,
    assignPlan
  };
};
