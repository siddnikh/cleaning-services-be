const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Profile = sequelize.define(
    "Profile",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["User", "Provider"],
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
        set() {
          throw new Error("Type cannot be modified after creation");
        },
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.ENUM(
          "United States",
          "Canada",
          "United Kingdom",
          "Germany",
          "France",
          "Italy",
          "Spain",
          "Japan",
          "China",
          "India",
          "Brazil",
          "Russia",
          "Australia",
          "Mexico",
          "South Korea",
          "Indonesia",
          "Turkey",
          "Saudi Arabia",
          "South Africa",
          "Argentina",
          "Egypt",
          "Pakistan",
          "Thailand",
          "Netherlands",
          "Switzerland",
          "Sweden",
          "Poland",
          "Belgium",
          "Norway",
          "Austria",
          "United Arab Emirates",
          "Israel",
          "Ireland",
          "Denmark",
          "Singapore",
          "Malaysia",
          "Philippines",
          "Vietnam",
          "New Zealand"
        ),
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isPostalCode: function (value) {
            if (!/^\d{5}(-\d{4})?$/.test(value)) {
              throw new Error("Invalid postal code format");
            }
          },
        },
      },
      interests: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      services: {
        type: DataTypes.ARRAY(
          DataTypes.ENUM(
            "Car Washing",
            "House Cleaning",
            "Gardening",
            "Pool Cleaning",
            "Boat Interior",
            "Window Cleaning"
          )
        ),
        allowNull: true,
        validate: {
          isValidForProvider(value) {
            if (this.type === "Provider" && (!value || value.length === 0)) {
              throw new Error("Services are required for Provider profiles");
            }
          },
        },
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
          isValidForProvider(value) {
            if (this.type === "Provider" && value === null) {
              throw new Error("Rating is required for Provider profiles");
            }
          },
        },
      },
    },
    {
      timestamps: true,
      tableName: "profiles",
    }
  );

  Profile.associate = (models) => {
    Profile.hasMany(models.ProviderRating, {
      as: "userRatings",
      foreignKey: "userProfileId",
      constraints: false,
      scope: {
        type: "User",
      },
    });

    Profile.hasMany(models.ProviderRating, {
      as: "providerRatings",
      foreignKey: "providerProfileId",
      constraints: false,
      scope: {
        type: "Provider",
      },
    });

    Profile.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId"
    });
  };

  return Profile;
};
