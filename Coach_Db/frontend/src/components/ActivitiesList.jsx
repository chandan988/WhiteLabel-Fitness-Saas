const ActivitiesList = ({ activities = [] }) => (
  <div className="bg-brand-card rounded-3xl p-5 shadow-card">
    <p className="font-semibold text-brand-ink mb-4">Daily Activities</p>
    <ul className="space-y-3 max-h-72 overflow-y-auto">
      {activities.map((activity) => (
        <li key={activity._id} className="flex justify-between items-center">
          <div>
            <p className="font-medium text-brand-ink">{activity.title}</p>
            <p className="text-sm text-brand-muted">{activity.time}</p>
          </div>
          <span className="text-sm text-emerald-600">{activity.status}</span>
        </li>
      ))}
      {!activities.length && (
        <p className="text-sm text-brand-muted">No activities logged today.</p>
      )}
    </ul>
  </div>
);

export default ActivitiesList;
