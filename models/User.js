const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100],
        },
      },
      pin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1000,
          max: 9999,
        },
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      language: {
        type: DataTypes.ENUM,
        values: [
          "English",
          "Español",
          "Français",
          "Deutsch",
          "Italiano",
          "Português",
        ],
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 13, // Assuming a minimum age requirement
          max: 120,
        },
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      country: {
        type: DataTypes.ENUM,
        values: [
          "USA",
          "Canada",
          "UK",
          "Germany",
          "France",
          "Spain",
          "Italy",
          "Japan",
          "Australia",
          "Brazil",
          "Other",
        ],
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM,
        values: ["Male", "Female", "Other"],
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otpExpiration: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verifiedOTP: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      // Model options
      timestamps: true,
      tableName: "users",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
      },
    }
  );

  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  // User bookmarks
  /**
   * User bookmark operations:
   *
   * - Add a service to a user's bookmarks:
   *   user.addBookmarkedService(service)
   *
   * - Remove a service from a user's bookmarks:
   *   user.removeBookmarkedService(service)
   *
   * - Get all bookmarked services for a user:
   *   user.getBookmarkedServices()
   *
   * - Check if a service is bookmarked by a user:
   *   user.hasBookmarkedService(service)
   */
  User.associate = (models) => {
    User.hasOne(models.Profile, {
      foreignKey: "userId",
      as: "profile",
    });
    User.belongsToMany(models.Service, {
      through: "UserBookmarks",
      as: "bookmarkedServices",
      foreignKey: "userId",
    });
    User.hasMany(models.Booking, {
      foreignKey: "userId",
      as: "bookings",
    });
  };

  return User;
};
