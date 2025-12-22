import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";

const NutritionPlans = () => (
  <DashboardLayout>
    <div className="bg-brand-card rounded-3xl p-8 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Nutrition Plans</h2>
          <p className="text-brand-muted">
            Curate white-label meal plans for coaches and clients.
          </p>
        </div>
        <PrimaryButton className="w-48">New Plan</PrimaryButton>
      </div>
      <p className="text-brand-muted">
        Start by building a meal plan or importing from the recipe library.
      </p>
    </div>
  </DashboardLayout>
);

export default NutritionPlans;
