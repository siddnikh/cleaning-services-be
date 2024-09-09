const { DataTypes } = require("sequelize");

/**
 * For each service, we have a description, tiers, location, rating, and providerProfileId.
 * The tiers are an array of objects with name, price, description, and characteristics.
 * The location is a point with latitude and longitude.
 * The rating is a decimal with a maximum of 5.
 * The photos are an array of strings that are URLs.
 * The providerProfileId is an integer that references the provider's profile id.
 * for each tier (example): {
    name: 'Tier Name',
    price: 100,
    currency: 'USD',
    description: 'Description of the tier',
    characteristics: ['Characteristic 1', 'Characteristic 2', ...]
  }
 */

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('Car Washing', 'House Cleaning', 'Gardening', 'Pool Cleaning', 'Boat Interior', 'Window Cleaning', 'Other'),
        allowNull: false,
      },
      tiers: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isValidTiers(value) {
            if (!Array.isArray(value) || value.length === 0) {
              throw new Error("Tiers must be a non-empty array");
            }
            value.forEach((tier) => {
              if (
                !tier.name ||
                !tier.price ||
                typeof tier.price !== "number" ||
                !tier.currency ||
                typeof tier.currency !== "string" ||
                !tier.description ||
                !Array.isArray(tier.characteristics)
              ) {
                throw new Error(
                  "Each tier must have a name, numeric price, currency (string), description, and an array of characteristics"
                );
              }
            });
          },
        },
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
      providerProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "profiles",
          key: "id",
        },
      },
      likedByUserIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: [],
      },
      photos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        validate: {
          isValidUrls(value) {
            if (!Array.isArray(value)) {
              throw new Error("Photos must be an array");
            }
            value.forEach((url) => {
              if (typeof url !== "string" || !url.match(/^https?:\/\/.+/)) {
                throw new Error("Each photo must be a valid URL string");
              }
            });
          },
        },
      },
    },
    {
      timestamps: true,
      tableName: "services",
    }
  );

  Service.associate = (models) => {
    Service.belongsTo(models.Profile, {
      foreignKey: "providerProfileId",
      as: "providerProfile",
      constraints: false,
      scope: {
        type: "Provider",
      },
    });

    Service.hasMany(models.ServiceRating, {
      foreignKey: "serviceId",
      as: "ratings",
    });

    Service.belongsToMany(models.User, {
      through: "UserBookmarks",
      as: "bookmarkedByUsers",
      foreignKey: "serviceId",
    });

    Service.hasMany(models.Booking, {
      foreignKey: 'serviceId',
      as: 'bookings',
    });
  };

  return Service;
};
