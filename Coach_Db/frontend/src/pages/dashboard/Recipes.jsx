import DashboardLayout from "./DashboardLayout.jsx";

const Recipes = () => (
  <DashboardLayout>
    <div className="bg-white rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe Library</h2>
      <p className="text-gray-500 mb-6">
        Store nutrient rich recipes to reuse across meal plans.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="border border-gray-100 rounded-2xl p-4">
            <p className="font-semibold text-gray-900">Recipe {idx}</p>
            <p className="text-sm text-gray-500">Protein packed bowl</p>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Recipes;
