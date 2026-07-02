export const getLocation = async (ip) => {
  try {
    // localhost/private IPs won't have real location
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return {
        country: "Unknown",
        city: "Unknown",
      };
    }

    const response = await fetch(
      `https://api.ipinfo.io/lite/${ip}?token=${process.env.IPINFO_TOKEN}`
    );

    if (!response.ok) {
      return {
        country: "Unknown",
        city: "Unknown",
      };
    }

    const data = await response.json();

    return {
      country: data.country || data.country_code || "Unknown",
      city: data.city || "Unknown",
    };
  } catch (error) {
    return {
      country: "Unknown",
      city: "Unknown",
    };
  }
};