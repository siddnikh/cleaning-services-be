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
    Booking.hasOne(CancelledBooking, {
      foreignKey: 'bookingId',
      as: 'cancellation',
    });
  };

  CancelledBooking.associate = (models) => {
    CancelledBooking.belongsTo(Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
    });
  };

  return { Booking, CancelledBooking };
};
