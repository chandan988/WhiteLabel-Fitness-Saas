import { useForm } from "react-hook-form";
import GradientLayout from "../../components/GradientLayout.jsx";
import OnboardingCard from "../../components/OnboardingCard.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useOnboardingStore } from "../../context/useOnboardingStore.js";
import { useNavigate } from "react-router-dom";

const steps = [
  "Sign up your account",
  "Set up your workspace",
  "Set up your profile"
];

const BusinessSetup = () => {
  const { stepData, updateData } = useOnboardingStore();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      businessType: stepData.businessType || "",
      services: stepData.services?.join(", ") || ""
    }
  });

  const onSubmit = (values) => {
    updateData({
      businessType: values.businessType,
      services: values.services
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    });
    navigate("/onboarding/profile");
  };

  return (
    <GradientLayout step={2} steps={steps}>
      <OnboardingCard
        title="Set up Coaching Business"
        subtitle="Tell us about the services you offer."
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            placeholder="Coaching type (Nutrition, Workout...)"
            register={register}
            name="businessType"
            required
          />
          <TextInput
            placeholder="Services (comma separated)"
            register={register}
            name="services"
            required
          />
          <PrimaryButton type="submit">Continue</PrimaryButton>
        </form>
      </OnboardingCard>
    </GradientLayout>
  );
};

export default BusinessSetup;
