import GradientLayout from "../../components/GradientLayout.jsx";
import OnboardingCard from "../../components/OnboardingCard.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useOnboardingStore } from "../../context/useOnboardingStore.js";
import { useNavigate } from "react-router-dom";

const steps = [
  "Sign up your account",
  "Set up your workspace",
  "Set up your profile"
];

const RoleSelection = () => {
  const { updateData } = useOnboardingStore();
  const navigate = useNavigate();

  const selectRole = (role) => {
    updateData({ role });
    navigate("/onboarding/business");
  };

  return (
    <GradientLayout step={1} steps={steps}>
      <OnboardingCard
        title="Select Role"
        subtitle="Let us know how you’ll use the platform."
      >
        <div className="space-y-4">
          <PrimaryButton onClick={() => selectRole("coach")}>I’m a Coach</PrimaryButton>
          <PrimaryButton
            onClick={() => selectRole("client")}
            className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
          >
            I’m a Client
          </PrimaryButton>
        </div>
      </OnboardingCard>
    </GradientLayout>
  );
};

export default RoleSelection;
