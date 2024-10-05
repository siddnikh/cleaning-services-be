const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CancelledBooking = sequelize.define('CancelledBooking', {
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    by: {
      type: DataTypes.ENUM('user', 'provider'),
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'cancelled_bookings',
  });

  CancelledBooking.associate = (models) => {
    CancelledBooking.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
    });
  };

  return CancelledBooking;
};
