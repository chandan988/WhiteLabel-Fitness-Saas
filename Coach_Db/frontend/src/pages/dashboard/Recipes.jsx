import DashboardLayout from "./DashboardLayout.jsx";

const Recipes = () => (
  <DashboardLayout>
    <div className="bg-brand-card rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-brand-ink mb-2">Recipe Library</h2>
      <p className="text-brand-muted mb-6">
        Store nutrient rich recipes to reuse across meal plans.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="border border-brand-border rounded-2xl p-4">
            <p className="font-semibold text-brand-ink">Recipe {idx}</p>
            <p className="text-sm text-brand-muted">Protein packed bowl</p>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Recipes;
