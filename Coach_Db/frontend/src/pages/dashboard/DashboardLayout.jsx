import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <main className="flex-1 px-10">
      <TopBar />
      {children}
    </main>
  </div>
);

export default DashboardLayout;
