import { useParams, Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useClients } from "../../hooks/useClients.js";
import { useOrgPath } from "../../hooks/useOrgPath.js";

const ClientDetail = () => {
  const { id } = useParams();
  const { clients, loading } = useClients();
  const buildPath = useOrgPath();
  const client = clients.find((item) => item._id === id);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-brand-muted">Loading client...</p>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <p className="text-brand-muted">Client not found.</p>
      </DashboardLayout>
    );
  }

  const mealPlan = client.mealPlan;
  const workoutPlan = client.workoutPlan;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-brand-muted">{client.email}</p>
        </div>
        <div className="flex gap-3">
          <Link to={buildPath(`/clients/${id}/assign-meal`)} className="w-40">
            <PrimaryButton>Assign Meal</PrimaryButton>
          </Link>
          <Link to={buildPath(`/clients/${id}/assign-workout`)} className="w-40">
            <PrimaryButton>Assign Workout</PrimaryButton>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-brand-card rounded-3xl p-6 shadow-card col-span-2">
          <h3 className="text-lg font-semibold text-brand-ink mb-4">
            Progress Tracking
          </h3>
          <ul className="space-y-3 text-sm text-brand-muted">
            <li>Weight: 78 kg</li>
            <li>Steps: 8,500 avg / week</li>
            <li>Sleep: 7 hrs avg</li>
            <li>Calories: 1,900 kcal avg</li>
          </ul>
        </div>
        <div className="bg-brand-card rounded-3xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-brand-ink mb-4">
            Meal Plan
          </h3>
          {mealPlan?.name ? (
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <span className="font-semibold">Name:</span>{" "}
                {mealPlan.name}
              </li>
              <li>
                <span className="font-semibold">Calories:</span>{" "}
                {mealPlan.calories || "-"}
              </li>
              <li>
                <span className="font-semibold">Notes:</span>{" "}
                {mealPlan.notes || "No notes added"}
              </li>
              <li className="text-xs text-brand-muted">
                Updated {mealPlan.assignedAt
                  ? new Date(mealPlan.assignedAt).toLocaleString()
                  : ""}
              </li>
            </ul>
          ) : (
            <p className="text-sm text-brand-muted">
              No meal plan assigned yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-6">
        <div className="bg-brand-card rounded-3xl p-6 shadow-card col-span-2">
          <h3 className="text-lg font-semibold text-brand-ink mb-4">
            Workout Plan
          </h3>
          {workoutPlan?.name ? (
            <div className="space-y-4 text-sm text-brand-muted">
              <div>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {workoutPlan.name}
                </p>
                <p>
                  <span className="font-semibold">Duration:</span>{" "}
                  {workoutPlan.duration || "-"} mins
                </p>
                <p className="text-xs text-brand-muted">
                  Updated{" "}
                  {workoutPlan.assignedAt
                    ? new Date(workoutPlan.assignedAt).toLocaleString()
                    : ""}
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Exercises</p>
                <ul className="space-y-2">
                  {workoutPlan.exercises?.map((exercise, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{exercise.name || "Exercise"}</span>
                      <span>
                        {exercise.sets || 0} x {exercise.reps || 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-brand-muted">
              No workout plan assigned yet.
            </p>
          )}
        </div>
        <div className="bg-brand-card rounded-3xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-brand-ink mb-4">
            Notes
          </h3>
          <p className="text-sm text-brand-muted">
            Keep hydration high and stretch before evening runs.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
