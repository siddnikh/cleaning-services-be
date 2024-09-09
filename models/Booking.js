const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    tableName: 'bookings',
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Booking.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service',
    });
    Booking.belongsTo(models.Profile, {
      foreignKey: 'providerProfileId',
      as: 'provider',
      constraints: false,
      scope: {
        type: 'Provider',
      },
    });
  };

  return Booking;
};
