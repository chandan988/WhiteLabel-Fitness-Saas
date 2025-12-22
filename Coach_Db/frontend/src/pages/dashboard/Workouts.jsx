import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";

const Workouts = () => (
  <DashboardLayout>
    <div className="bg-brand-card rounded-3xl p-8 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Workout Library</h2>
          <p className="text-brand-muted">
            Maintain reusable workout templates for your tenants.
          </p>
        </div>
        <PrimaryButton className="w-48">Create Workout</PrimaryButton>
      </div>
      <div className="mt-6 text-brand-muted">
        No workouts yet. Add your first template.
      </div>
    </div>
  </DashboardLayout>
);

export default Workouts;
