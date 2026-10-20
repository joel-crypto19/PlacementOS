const Notification = require('../models/Notification');

/**
 * Creates an in-app notification for a user
 * @param {Object} param0 
 */
const createNotification = async ({ recipient, title, message, type = 'system', link = '' }) => {
  try {
    if (!recipient || !title || !message) return null;
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
      isRead: false
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
