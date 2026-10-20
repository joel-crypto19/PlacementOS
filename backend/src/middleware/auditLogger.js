const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  req,
  user,
  action,
  resourceType,
  resourceId = '',
  details = {}
}) => {
  try {
    const actorUser = user || (req ? req.user : null);
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const userAgent = req ? req.headers['user-agent'] || '' : '';

    await AuditLog.create({
      user: actorUser ? actorUser._id : null,
      userEmail: actorUser ? actorUser.email : 'anonymous',
      role: actorUser ? actorUser.role : 'guest',
      action,
      resourceType,
      resourceId: String(resourceId),
      details,
      ipAddress: String(ip),
      userAgent: String(userAgent)
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to record audit log:', error.message);
  }
};

module.exports = { logAudit };
