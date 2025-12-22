import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import GradientLayout from "../../components/GradientLayout.jsx";
import OnboardingCard from "../../components/OnboardingCard.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useOnboardingStore } from "../../context/useOnboardingStore.js";

const steps = [
  "Sign up your account",
  "Set up your workspace",
  "Set up your profile"
];

const ProfileSetup = () => {
  const { stepData, updateData } = useOnboardingStore();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      businessName: stepData.businessName || "",
      clientCount: stepData.clientCount || "",
      city: stepData.city || ""
    }
  });

  const onSubmit = (values) => {
    updateData(values);
    navigate("/onboarding/password");
  };

  return (
    <GradientLayout step={3} steps={steps} cardAlign="center">
      <OnboardingCard
        title="Set up your Profile"
        subtitle="We’ll use this to create the best launch plan for you."
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            placeholder="Name of your business"
            register={register}
            name="businessName"
            required
          />
          <TextInput
            placeholder="Expected no. of clients"
            type="number"
            register={register}
            name="clientCount"
            required
          />
          <TextInput
            placeholder="City"
            register={register}
            name="city"
            required
          />
          <PrimaryButton type="submit">Confirm</PrimaryButton>
        </form>
      </OnboardingCard>
    </GradientLayout>
  );
};

export default ProfileSetup;
