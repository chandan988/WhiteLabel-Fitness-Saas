import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useForm } from "react-hook-form";
import { updateClient } from "../../services/api.js";
import { useOrgPath } from "../../hooks/useOrgPath.js";

const AssignMeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const buildPath = useOrgPath();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    await updateClient(id, {
      mealPlan: {
        name: values.name,
        calories: values.calories,
        notes: values.notes,
        assignedAt: new Date().toISOString()
      }
    });
    navigate(buildPath(`/clients/${id}`));
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl bg-brand-card rounded-3xl p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-brand-ink mb-2">
          Assign Meal Plan
        </h2>
        <p className="text-brand-muted mb-6">
          Build tailored nutrition guidance for the client.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            placeholder="Meal plan name"
            register={register}
            name="name"
            required
          />
          <TextInput
            placeholder="Calories target"
            type="number"
            register={register}
            name="calories"
          />
          <TextInput
            placeholder="Notes"
            register={register}
            name="notes"
          />
          <PrimaryButton type="submit">Save Meal Plan</PrimaryButton>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AssignMeal;
