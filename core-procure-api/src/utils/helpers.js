// Soft delete filter to append to all GET queries
const getActiveFilter = (showInactive = false) => {
  if (showInactive) return {};
  return { isActive: true, deletedAt: null };
};

module.exports = { getActiveFilter };