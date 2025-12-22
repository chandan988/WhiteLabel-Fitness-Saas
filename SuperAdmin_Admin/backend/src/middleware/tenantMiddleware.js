export const enforceTenant = (req, res, next) => {
  if (req.user.role === "superadmin") {
    return next();
  }
  const targetTenant =
    req.params.tenantId ||
    req.body.tenantId ||
    req.query.tenantId ||
    req.user.tenantId;

  if (!targetTenant || `${targetTenant}` !== `${req.user.tenantId}`) {
    return res.status(403).json({ message: "Tenant mismatch" });
  }
  next();
};
