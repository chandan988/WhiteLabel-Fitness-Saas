import { useForm } from "react-hook-form";
import { adminLogin } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    const { data } = await adminLogin(values);
    login(data);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-3xl shadow-card p-10 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Super Admin Login
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1"
              {...register("email", { required: true })}
              type="email"
              placeholder="owner@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1"
              {...register("password", { required: true })}
              type="password"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-2xl py-3 font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

