import { useForm } from "react-hook-form";
import DashboardLayout from "./DashboardLayout.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useClients } from "../../hooks/useClients.js";
import { useNavigate } from "react-router-dom";
import { useOrgPath } from "../../hooks/useOrgPath.js";

const AddClient = () => {
  const { addClient } = useClients();
  const navigate = useNavigate();
  const buildPath = useOrgPath();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (values) => {
    await addClient(values);
    reset();
    navigate(buildPath("/clients"));
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl bg-brand-card rounded-3xl shadow-card p-8">
        <h2 className="text-2xl font-semibold text-brand-ink mb-4">
          Add New Client
        </h2>
        <p className="text-brand-muted mb-8">
          Capture the essential information to invite your client.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              placeholder="First name"
              register={register}
              name="firstName"
              required
            />
            <TextInput
              placeholder="Last name"
              register={register}
              name="lastName"
              required
            />
          </div>
          <TextInput
            type="email"
            placeholder="Email address"
            register={register}
            name="email"
            required
          />
          <TextInput
            placeholder="Goals (comma separated)"
            register={register}
            name="goals"
          />
          <PrimaryButton type="submit">Create Client</PrimaryButton>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddClient;
