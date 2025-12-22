import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";

const Workouts = () => (
  <DashboardLayout>
    <div className="bg-white rounded-3xl p-8 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Workout Library</h2>
          <p className="text-gray-500">
            Maintain reusable workout templates for your tenants.
          </p>
        </div>
        <PrimaryButton className="w-48">Create Workout</PrimaryButton>
      </div>
      <div className="mt-6 text-gray-500">
        No workouts yet. Add your first template.
      </div>
    </div>
  </DashboardLayout>
);

export default Workouts;
