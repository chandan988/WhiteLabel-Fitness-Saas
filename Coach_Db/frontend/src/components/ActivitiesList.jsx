const ActivitiesList = ({ activities = [] }) => (
  <div className="bg-white rounded-3xl p-5 shadow-card">
    <p className="font-semibold text-gray-900 mb-4">Daily Activities</p>
    <ul className="space-y-3 max-h-72 overflow-y-auto">
      {activities.map((activity) => (
        <li key={activity._id} className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.time}</p>
          </div>
          <span className="text-sm text-emerald-600">{activity.status}</span>
        </li>
      ))}
      {!activities.length && (
        <p className="text-sm text-gray-500">No activities logged today.</p>
      )}
    </ul>
  </div>
);

export default ActivitiesList;
