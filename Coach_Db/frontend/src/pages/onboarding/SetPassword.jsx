import { useForm } from "react-hook-form";
import GradientLayout from "../../components/GradientLayout.jsx";
import OnboardingCard from "../../components/OnboardingCard.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setPassword, updateTenant } from "../../services/api.js";
import { useOnboardingStore } from "../../context/useOnboardingStore.js";
import { useAuth } from "../../context/AuthContext.jsx";

const steps = [
  "Sign up your account",
  "Set up your workspace",
  "Set up your profile"
];

const SetPassword = () => {
  const { stepData, reset } = useOnboardingStore();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    if (!stepData.email) {
      navigate("/onboarding/signup");
    }
  }, [stepData.email, navigate]);

  const onSubmit = async (values) => {
    if (values.password !== values.confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      await setPassword({ email: stepData.email, password: values.password });
      const loginResponse = await login({
        email: stepData.email,
        password: values.password
      });
      const tenantId =
        loginResponse?.user?.tenantId || stepData.tenantId;
      if (tenantId) {
        await updateTenant(tenantId, {
          name: stepData.businessName,
          city: stepData.city,
          clientLimit: stepData.clientCount,
          services: stepData.services || [],
          businessType: stepData.businessType
        });
      }
      reset();
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <GradientLayout step={3} steps={steps}>
      <OnboardingCard title="Set your password">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            type="password"
            placeholder="Enter your password"
            register={register}
            name="password"
            required
            minLength={8}
          />
          <TextInput
            type="password"
            placeholder="Confirm your password"
            register={register}
            name="confirm"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500">
            Must be at least 8 characters.
          </p>
          <PrimaryButton type="submit">Set Password</PrimaryButton>
        </form>
      </OnboardingCard>
    </GradientLayout>
  );
};

export default SetPassword;
