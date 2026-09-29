const LicensorUser = require("../models/LicensorUser");

const syncLicensorUser = async (user) => {
  if (!user || user.role !== "licensor" || !user.licensorId) return null;

  return LicensorUser.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      licensorId: user.licensorId,
      assignedBookIds: user.assignedBookIds || [],
      status: user.status,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    },
    { new: true, upsert: true, runValidators: true },
  );
};

const removeLicensorUser = async (userId) => {
  if (!userId) return null;
  return LicensorUser.deleteOne({ userId });
};

module.exports = { syncLicensorUser, removeLicensorUser };
