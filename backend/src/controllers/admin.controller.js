import {
  getSuperAdminMetadata,
  getDashboardAnalytics,
  listAllUsers,
  listStaffMembers,
  createStaffMember,
  updateStaffMember as updateStaffService,
  deleteStaffMember as deleteStaffService,
} from '../services/admin.service.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await listAllUsers(req.query);
    return res.status(200).json({
      success: true,
      count: result.count,
      total: result.total,
      page: result.page,
      pages: result.pages,
      users: result.users,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await getDashboardAnalytics();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getSuperAdminInfo = (req, res) => {
  const meta = getSuperAdminMetadata();
  return res.status(200).json({
    success: true,
    superAdminEmail: meta.superAdminEmail,
  });
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await listStaffMembers();
    const meta = getSuperAdminMetadata();
    return res.status(200).json({
      success: true,
      count: staff.length,
      superAdminEmail: meta.superAdminEmail,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

export const addStaffMember = async (req, res, next) => {
  try {
    const staff = await createStaffMember(req.body);
    return res.status(201).json({
      success: true,
      message: `Staff member ${staff.name} added successfully!`,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await updateStaffService(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      staff,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteStaffService(id);
    return res.status(200).json({
      success: true,
      message: 'Staff member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
