const formatMeta = (meta) => {
  if (!meta || typeof meta !== "object" || Object.keys(meta).length === 0) {
    return "";
  }
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch (err) {
    return ` ${meta}`;
  }
};

const baseLog = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${level}] ${timestamp} ${message}${formatMeta(meta)}`;
  if (level === "ERROR") {
    console.error(fullMessage);
  } else if (level === "WARN") {
    console.warn(fullMessage);
  } else {
    console.log(fullMessage);
  }
};

export const logger = {
  info: (message, meta) => baseLog("INFO", message, meta),
  warn: (message, meta) => baseLog("WARN", message, meta),
  error: (message, meta) => baseLog("ERROR", message, meta)
};
