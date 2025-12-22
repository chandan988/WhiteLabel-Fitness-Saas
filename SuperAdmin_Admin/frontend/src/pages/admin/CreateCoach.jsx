import { useForm } from "react-hook-form";
import { createCoach } from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CreateCoach = () => {
  const { register, handleSubmit, reset } = useForm();
  const [password, setPassword] = useState("");
  const [createdCoach, setCreatedCoach] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoBase64, setLogoBase64] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result?.toString() || "");
      setLogoPreview(reader.result?.toString() || "");
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      const brandingPayload = {
        appName: values.appName,
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor
      };
      if (logoBase64) {
        brandingPayload.logoBase64 = logoBase64;
      } else if (values.logoUrl) {
        brandingPayload.logoUrl = values.logoUrl;
      }

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        profile: {
          businessName: values.businessName,
          services: values.services
            ? values.services.split(",").map((s) => s.trim())
            : []
        },
        branding: brandingPayload
      };

      const { data } = await createCoach(payload);
      setPassword(data.password);
      setCreatedCoach({
        email: data.coach.email,
        slug: data.tenant.slug,
        appName:
          data.tenant?.branding?.appName ||
          brandingPayload.appName ||
          payload.profile.businessName
      });
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create coach");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
    } catch (err) {
      console.error("Clipboard write failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-card p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Create Coach App
        </h1>
        <p className="text-gray-500 mb-6">
          Configure branding + credentials. Share the generated password with
          the coach.
        </p>
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-4">
            {error}
          </div>
        )}
        {password && createdCoach && (
          <div className="mb-6 border border-emerald-200 rounded-2xl p-5 bg-emerald-50 text-emerald-900">
            <p className="font-semibold text-lg">
              Temporary Password: <span className="font-mono">{password}</span>
            </p>
            <p className="text-sm mt-2 text-emerald-800">
              Slug / Login URL:{" "}
              <span className="font-mono">
                {createdCoach.slug} — https://coachdb.com/{createdCoach.slug}/login
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={copyPassword}
                className="px-4 py-2 rounded-2xl bg-white text-emerald-700 font-semibold shadow"
              >
                Copy Password
              </button>
              <button
                onClick={() => navigate("/admin/coaches")}
                className="px-4 py-2 rounded-2xl bg-emerald-600 text-white font-semibold"
              >
                Back to Coach Directory
              </button>
            </div>
          </div>
        )}
        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm text-gray-600">First Name</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("firstName", { required: true })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Last Name</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("lastName", { required: true })}
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("email", { required: true })}
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Business Name</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("businessName")}
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Services (comma separated)</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("services")}
            />
          </div>
          <div className="col-span-2 pt-4">
            <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">App Name</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("appName")}
              placeholder="CoachPro for Alex"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Logo URL</label>
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                {...register("logoUrl")}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                Or Upload Logo (stored as Base64)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-dashed border-gray-300 rounded-2xl px-4 py-2 bg-gray-50"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
          {logoPreview && (
            <div className="col-span-2">
              <p className="text-xs uppercase text-gray-500">Preview</p>
              <img
                src={logoPreview}
                alt="Uploaded logo preview"
                className="h-16 mt-2 object-contain"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-600">Primary Color</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("primaryColor")}
              placeholder="#0f172a"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Secondary Color</label>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3"
              {...register("secondaryColor")}
              placeholder="#38bdf8"
            />
          </div>
          <div className="col-span-2 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white rounded-2xl py-3 font-semibold disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Coach"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoach;
