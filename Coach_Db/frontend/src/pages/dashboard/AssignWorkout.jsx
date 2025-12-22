import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useForm, useFieldArray } from "react-hook-form";
import { updateClient } from "../../services/api.js";
import { useOrgPath } from "../../hooks/useOrgPath.js";

const AssignWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const buildPath = useOrgPath();
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: "",
      duration: 45,
      exercises: [{ name: "Pushups", sets: 3, reps: 12 }]
    }
  });
  const { fields, append } = useFieldArray({ control, name: "exercises" });

  const onSubmit = async (values) => {
    await updateClient(id, {
      workoutPlan: {
        name: values.name,
        duration: values.duration,
        exercises: values.exercises,
        assignedAt: new Date().toISOString()
      }
    });
    navigate(buildPath(`/clients/${id}`));
  };

  return (
    <DashboardLayout>
      <div className="bg-brand-card rounded-3xl p-8 shadow-card max-w-3xl">
        <h2 className="text-2xl font-semibold text-brand-ink mb-2">
          Assign Workout Plan
        </h2>
        <p className="text-brand-muted mb-6">
          Build a guided routine with exercises.
        </p>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              placeholder="Workout name"
              register={register}
              name="name"
            />
            <TextInput
              placeholder="Duration (mins)"
              type="number"
              register={register}
              name="duration"
            />
          </div>
          <div className="space-y-4">
            <p className="font-semibold text-brand-ink">Exercises</p>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-3 gap-3 bg-brand-surface rounded-2xl p-4"
              >
                <TextInput
                  placeholder="Exercise name"
                  register={register}
                  name={`exercises.${index}.name`}
                />
                <TextInput
                  placeholder="Sets"
                  type="number"
                  register={register}
                  name={`exercises.${index}.sets`}
                />
                <TextInput
                  placeholder="Reps"
                  type="number"
                  register={register}
                  name={`exercises.${index}.reps`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ name: "", sets: 3, reps: 12 })}
              className="text-sm font-semibold text-brand-primary"
            >
              + Add exercise
            </button>
          </div>
          <PrimaryButton type="submit">Save Workout Plan</PrimaryButton>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AssignWorkout;
