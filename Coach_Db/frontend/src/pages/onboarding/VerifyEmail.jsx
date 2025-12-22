import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import GradientLayout from "../../components/GradientLayout.jsx";
import OnboardingCard from "../../components/OnboardingCard.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { verifyEmail } from "../../services/api.js";
import { useOnboardingStore } from "../../context/useOnboardingStore.js";

const steps = [
  "Sign up your account",
  "Set up your workspace",
  "Set up your profile"
];

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { stepData, updateData } = useOnboardingStore();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    try {
      await verifyEmail({ token: values.token });
      updateData({ emailVerified: true });
      navigate("/onboarding/role");
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <GradientLayout step={1} steps={steps}>
      <OnboardingCard
        title="Verify Email"
        subtitle={`We sent a verification code to ${stepData.email || "your email"}`}
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {stepData.verificationToken && (
            <p className="text-xs text-emerald-600">
              Demo token: {stepData.verificationToken}
            </p>
          )}
          <TextInput
            placeholder="Enter verification code"
            register={register}
            name="token"
            required
          />
          <PrimaryButton type="submit">Verify Email</PrimaryButton>
        </form>
      </OnboardingCard>
    </GradientLayout>
  );
};

export default VerifyEmail;
