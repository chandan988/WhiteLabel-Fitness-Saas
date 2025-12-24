import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import TextInput from "../../components/TextInput.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { useBranding } from "../../context/BrandingContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTenant } from "../../context/TenantContext.jsx";
import {
  changePassword,
  updateProfile,
  updateTenant
} from "../../services/api.js";

const DEFAULT_BRANDING = {
  brandName: "Jeevanshaili",
  primaryColor: "#0d9488",
  secondaryColor: "#115e59",
  primaryHoverColor: "#0b7f71",
  secondaryHoverColor: "#0b4f4c",
  sidebarColor: "#115e59",
  surfaceColor: "#f8fafc",
  cardColor: "#ffffff",
  textColor: "#0f172a",
  mutedTextColor: "#64748b",
  borderColor: "#e2e8f0",
  buttonTextColor: "#ffffff",
  shadowColor: "#0f172a"
};

const Settings = () => {
  const { branding } = useBranding();
  const { user, setUser } = useAuth();
  const { tenant, setTenant } = useTenant();
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    avatar: ""
  });
  const [brandingForm, setBrandingForm] = useState({
    ...DEFAULT_BRANDING,
    brandName: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [brandMessage, setBrandMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatar: user.profile?.avatar || ""
      });
    }
  }, [user]);

  useEffect(() => {
    setBrandingForm({
      ...DEFAULT_BRANDING,
      brandName: branding.appName || "",
      primaryColor: branding.primaryColor || DEFAULT_BRANDING.primaryColor,
      secondaryColor: branding.secondaryColor || DEFAULT_BRANDING.secondaryColor,
      primaryHoverColor:
        branding.primaryHoverColor || DEFAULT_BRANDING.primaryHoverColor,
      secondaryHoverColor:
        branding.secondaryHoverColor || DEFAULT_BRANDING.secondaryHoverColor,
      sidebarColor: branding.sidebarColor || DEFAULT_BRANDING.sidebarColor,
      surfaceColor: branding.surfaceColor || DEFAULT_BRANDING.surfaceColor,
      cardColor: branding.cardColor || DEFAULT_BRANDING.cardColor,
      textColor: branding.textColor || DEFAULT_BRANDING.textColor,
      mutedTextColor: branding.mutedTextColor || DEFAULT_BRANDING.mutedTextColor,
      borderColor: branding.borderColor || DEFAULT_BRANDING.borderColor,
      buttonTextColor:
        branding.buttonTextColor || DEFAULT_BRANDING.buttonTextColor,
      shadowColor: branding.shadowColor || DEFAULT_BRANDING.shadowColor
    });
  }, [branding]);

  const handleResetBranding = async () => {
    if (!tenant?.id) return;
    const resetValues = {
      ...DEFAULT_BRANDING,
      brandName: tenant?.name || DEFAULT_BRANDING.brandName
    };
    setBrandSaving(true);
    setBrandMessage("");
    try {
      const payload = {
        branding: {
          appName: resetValues.brandName,
          primaryColor: resetValues.primaryColor,
          secondaryColor: resetValues.secondaryColor,
          primaryHoverColor: resetValues.primaryHoverColor,
          secondaryHoverColor: resetValues.secondaryHoverColor,
          sidebarColor: resetValues.sidebarColor,
          surfaceColor: resetValues.surfaceColor,
          cardColor: resetValues.cardColor,
          textColor: resetValues.textColor,
          mutedTextColor: resetValues.mutedTextColor,
          borderColor: resetValues.borderColor,
          buttonTextColor: resetValues.buttonTextColor,
          shadowColor: resetValues.shadowColor
        }
      };
      const { data } = await updateTenant(tenant.id, payload);
      setTenant((prev) => ({
        ...(prev || {}),
        ...data,
        id: data.id || data._id || prev?.id,
        branding: data.branding || prev?.branding
      }));
      setBrandingForm(resetValues);
      setBrandMessage("Branding reset to default.");
    } catch (err) {
      setBrandMessage(
        err.response?.data?.message || "Failed to reset branding"
      );
    } finally {
      setBrandSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMessage("");
    setProfileError("");
    try {
      const { data } = await updateProfile(profileForm);
      setUser((prev) => ({ ...prev, ...data.user }));
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleBrandSave = async () => {
    if (!tenant?.id) return;
    setBrandSaving(true);
    setBrandMessage("");
    try {
      const payload = {
        branding: {
          appName: brandingForm.brandName,
          primaryColor: brandingForm.primaryColor,
          secondaryColor: brandingForm.secondaryColor,
          primaryHoverColor: brandingForm.primaryHoverColor,
          secondaryHoverColor: brandingForm.secondaryHoverColor,
          sidebarColor: brandingForm.sidebarColor,
          surfaceColor: brandingForm.surfaceColor,
          cardColor: brandingForm.cardColor,
          textColor: brandingForm.textColor,
          mutedTextColor: brandingForm.mutedTextColor,
          borderColor: brandingForm.borderColor,
          buttonTextColor: brandingForm.buttonTextColor,
          shadowColor: brandingForm.shadowColor
        }
      };
      const { data } = await updateTenant(tenant.id, payload);
      setTenant((prev) => ({
        ...(prev || {}),
        ...data,
        id: data.id || data._id || prev?.id,
        branding: data.branding || prev?.branding
      }));
      setBrandMessage("Branding updated.");
    } catch (err) {
      setBrandMessage(err.response?.data?.message || "Failed to update branding");
    } finally {
      setBrandSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordSaving(true);
    setPasswordMessage("");
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      setPasswordSaving(false);
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMessage("Password updated.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to update password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="bg-brand-card rounded-3xl shadow-card p-8">
          <h2 className="text-2xl font-semibold text-brand-ink mb-6">Settings</h2>
          <div className="flex items-center gap-6">
            <img
              src={profileForm.avatar || "https://i.pravatar.cc/120"}
              alt="profile"
              className="h-24 w-24 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-semibold text-brand-ink">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-brand-muted">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-brand-card rounded-3xl shadow-card p-8">
          <h3 className="text-xl font-semibold text-brand-ink mb-4">
            Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="First name"
              value={profileForm.firstName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  firstName: e.target.value
                }))
              }
            />
            <TextInput
              label="Last name"
              value={profileForm.lastName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  lastName: e.target.value
                }))
              }
            />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-brand-ink">
              Profile picture
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block text-sm text-brand-muted"
              onChange={handleAvatarUpload}
            />
          </div>
          {profileError && (
            <p className="text-sm text-red-500 mt-3">{profileError}</p>
          )}
          {profileMessage && (
            <p className="text-sm text-emerald-600 mt-3">{profileMessage}</p>
          )}
          <div className="mt-4">
            <PrimaryButton
              type="button"
              onClick={handleProfileSave}
              disabled={profileSaving}
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </PrimaryButton>
          </div>
        </div>

        <div className="bg-brand-card rounded-3xl shadow-card p-8">
          <h3 className="text-xl font-semibold text-brand-ink mb-4">
            Brand Theme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Brand name"
              value={brandingForm.brandName}
              onChange={(e) =>
                setBrandingForm((prev) => ({
                  ...prev,
                  brandName: e.target.value
                }))
              }
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Primary color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.primaryColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      primaryColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.primaryColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Secondary color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.secondaryColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      secondaryColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.secondaryColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Primary hover color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.primaryHoverColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      primaryHoverColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.primaryHoverColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Secondary hover color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.secondaryHoverColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      secondaryHoverColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.secondaryHoverColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Sidebar background
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.sidebarColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      sidebarColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.sidebarColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Surface background
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.surfaceColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      surfaceColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.surfaceColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Card background
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.cardColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      cardColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.cardColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Text color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.textColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      textColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.textColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Muted text color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.mutedTextColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      mutedTextColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.mutedTextColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Border color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.borderColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      borderColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.borderColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Button text color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.buttonTextColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      buttonTextColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.buttonTextColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-ink">
                Shadow color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.shadowColor}
                  onChange={(e) =>
                    setBrandingForm((prev) => ({
                      ...prev,
                      shadowColor: e.target.value
                    }))
                  }
                  className="h-10 w-14 rounded-lg border border-brand-border"
                />
                <span className="text-sm text-brand-muted">
                  {brandingForm.shadowColor}
                </span>
              </div>
            </div>
          </div>
          {brandMessage && (
            <p className="text-sm text-emerald-600 mt-3">{brandMessage}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PrimaryButton
              type="button"
              onClick={handleBrandSave}
              disabled={brandSaving || !tenant?.id}
            >
              {brandSaving ? "Saving..." : "Save Settings"}
            </PrimaryButton>
            <button
              type="button"
              className="px-6 py-3 rounded-2xl border border-brand-border text-brand-ink font-semibold"
              onClick={handleResetBranding}
              disabled={brandSaving || !tenant?.id}
            >
              Reset to Default
            </button>
          </div>
        </div>

        <div className="bg-brand-card rounded-3xl shadow-card p-8">
          <h3 className="text-xl font-semibold text-brand-ink mb-4">
            Change Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value
                }))
              }
            />
            <TextInput
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value
                }))
              }
            />
            <TextInput
              label="Confirm new password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))
              }
            />
          </div>
          {passwordError && (
            <p className="text-sm text-red-500 mt-3">{passwordError}</p>
          )}
          {passwordMessage && (
            <p className="text-sm text-emerald-600 mt-3">{passwordMessage}</p>
          )}
          <div className="mt-4">
            <PrimaryButton
              type="button"
              onClick={handlePasswordSave}
              disabled={passwordSaving}
            >
              {passwordSaving ? "Saving..." : "Update Password"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
