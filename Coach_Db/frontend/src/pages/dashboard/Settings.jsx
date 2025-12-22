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
    brandName: "",
    primaryColor: "#0d9488",
    secondaryColor: "#115e59"
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
      brandName: branding.appName || "",
      primaryColor: branding.primaryColor || "#0d9488",
      secondaryColor: branding.secondaryColor || "#115e59"
    });
  }, [branding]);

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
          secondaryColor: brandingForm.secondaryColor
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
        <div className="bg-white rounded-3xl shadow-card p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h2>
          <div className="flex items-center gap-6">
            <img
              src={profileForm.avatar || "https://i.pravatar.cc/120"}
              alt="profile"
              className="h-24 w-24 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
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
            <label className="text-sm font-medium text-gray-700">
              Profile picture
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block text-sm text-gray-600"
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

        <div className="bg-white rounded-3xl shadow-card p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
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
              <label className="text-sm font-medium text-gray-700">
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
                  className="h-10 w-14 rounded-lg border border-gray-200"
                />
                <span className="text-sm text-gray-600">
                  {brandingForm.primaryColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
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
                  className="h-10 w-14 rounded-lg border border-gray-200"
                />
                <span className="text-sm text-gray-600">
                  {brandingForm.secondaryColor}
                </span>
              </div>
            </div>
          </div>
          {brandMessage && (
            <p className="text-sm text-emerald-600 mt-3">{brandMessage}</p>
          )}
          <div className="mt-4">
            <PrimaryButton
              type="button"
              onClick={handleBrandSave}
              disabled={brandSaving || !tenant?.id}
            >
              {brandSaving ? "Saving..." : "Save Settings"}
            </PrimaryButton>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
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
