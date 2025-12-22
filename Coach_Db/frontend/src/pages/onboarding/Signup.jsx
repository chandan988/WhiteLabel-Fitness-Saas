import { useForm } from "react-hook-form";
import GradientLayout from "../../components/GradientLayout.jsx";
import OnboardingCard from "../../components/OnboardingCard.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore } from "../../context/useOnboardingStore.js";
import { signupCoach } from "../../services/api.js";
import { useEffect, useState } from "react";

const steps = [
  "Sign up your account",
  "Set up your workspace",
  "Set up your profile"
];

const Signup = () => {
  const navigate = useNavigate();
  const { stepData, updateData } = useOnboardingStore();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: stepData.firstName || "",
      lastName: stepData.lastName || "",
      email: stepData.email || ""
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stepData.role) {
      updateData({ role: "coach" });
    }
  }, [stepData.role, updateData]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      updateData(values);
      const { data } = await signupCoach({
        ...stepData,
        ...values,
        role: stepData.role || "coach"
      });
      updateData({
        userId: data.userId,
        tenantId: data.tenantId,
        verificationToken: data.verificationToken
      });
      navigate("/onboarding/verify-email");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientLayout step={1} steps={steps}>
      <OnboardingCard
        title="Sign Up Account"
        subtitle="Enter your personal data to create your account."
      >
        <div className="space-y-6">
          <button className="w-full border border-brand-border rounded-2xl py-3 flex items-center justify-center gap-3 font-medium">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="h-5 w-5" />
            Sign up with Google
          </button>
          <div className="relative text-center text-sm text-brand-muted">
            <span className="bg-brand-card px-3">Or</span>
            <div className="h-px bg-brand-border absolute inset-x-0 top-1/2 -z-10" />
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                placeholder="eg. John"
                register={register}
                name="firstName"
                required
              />
              <TextInput
                placeholder="eg. Francisco"
                register={register}
                name="lastName"
                required
              />
            </div>
            <TextInput
              type="email"
              placeholder="eg. johnfrans@gmail.com"
              register={register}
              name="email"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              {["coach", "client"].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`border rounded-2xl py-3 font-semibold ${
                    (stepData.role || "coach") === role
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-brand-border hover:border-brand-primary"
                  }`}
                  onClick={() => updateData({ role })}
                >
                  {role === "coach" ? "I'm a Coach" : "I'm a Client"}
                </button>
              ))}
            </div>
            <PrimaryButton type="submit">
              {loading ? "Submitting..." : "Sign Up"}
            </PrimaryButton>
          </form>
          <p className="text-center text-sm text-brand-muted">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-brand-ink">
              Log in
            </a>
          </p>
        </div>
      </OnboardingCard>
    </GradientLayout>
  );
};

export default Signup;
