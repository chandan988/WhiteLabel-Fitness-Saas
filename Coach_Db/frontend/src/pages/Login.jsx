import { useForm } from "react-hook-form";
import PrimaryButton from "../components/PrimaryButton.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../context/TenantContext.jsx";
import { useEffect } from "react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { orgId, tenant, loading, error } = useTenant();
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    document.title = tenant
      ? `Login | ${tenant.name || tenant.orgId}`
      : "Coach Dashboard Login";
  }, [tenant]);

  const onSubmit = async (values) => {
    await login({ ...values, orgId });
    navigate(`/${orgId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading organization branding...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-2xl font-semibold text-gray-900">Organization not found</p>
        <p className="text-gray-600 max-w-lg">
          {error || "Please verify the link sent by the Super Admin or contact support."}
        </p>
        <a
          href="/"
          className="text-brand-primary font-semibold underline underline-offset-2"
        >
          Return to landing
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl p-10 shadow-card w-full max-w-md space-y-2">
        <p className="text-sm uppercase tracking-widest text-brand-primary font-semibold">
          {tenant.branding?.appName || tenant.name}
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Log in to your dashboard
        </h1>
        <p className="text-gray-500 mb-6">
          Organization ID: <span className="font-mono text-gray-800">{orgId}</span>
        </p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            placeholder="Email"
            register={register}
            name="email"
            required
          />
          <TextInput
            placeholder="Password"
            type="password"
            register={register}
            name="password"
            required
          />
          <PrimaryButton type="submit" className="w-full">
            Login
          </PrimaryButton>
        </form>
        <p className="text-xs text-gray-500 mt-4">
          Need help? Contact the Super Admin to reset your credentials or resend your
          onboarding email.
        </p>
      </div>
    </div>
  );
};

export default Login;
