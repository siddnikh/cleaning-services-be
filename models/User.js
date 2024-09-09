const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const Rating = require('./Rating');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },
    pin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1000,
        max: 9999
      }
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    language: {
      type: DataTypes.ENUM,
      values: ['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português'],
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 13, // Assuming a minimum age requirement
        max: 120
      }
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    country: {
      type: DataTypes.ENUM,
      values: ['USA', 'Canada', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Japan', 'Australia', 'Brazil', 'Other'],
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM,
      values: ['Male', 'Female', 'Other'],
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otpExpiration: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verifiedOTP: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    // Model options
    timestamps: true,
    tableName: 'users',
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
      }
    }
  });

  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  const Profile = sequelize.define('Profile', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['User', 'Provider'],
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true
      },
      set() {
        throw new Error('Type cannot be modified after creation');
      }
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.ENUM(
        'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Japan', 'China', 'India',
        'Brazil', 'Russia', 'Australia', 'Mexico', 'South Korea', 'Indonesia', 'Turkey', 'Saudi Arabia', 'South Africa',
        'Argentina', 'Egypt', 'Pakistan', 'Thailand', 'Netherlands', 'Switzerland', 'Sweden', 'Poland', 'Belgium',
        'Norway', 'Austria', 'United Arab Emirates', 'Israel', 'Ireland', 'Denmark', 'Singapore', 'Malaysia', 'Philippines',
        'Vietnam', 'New Zealand'
      ),
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isPostalCode: function(value) {
          if (!/^\d{5}(-\d{4})?$/.test(value)) {
            throw new Error('Invalid postal code format');
          }
        }
      }
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    services: {
      type: DataTypes.ARRAY(DataTypes.ENUM('Car Washing', 'House Cleaning', 'Gardening', 'Pool Cleaning', 'Boat Interior', 'Window Cleaning')),
      allowNull: true,
      validate: {
        isValidForProvider(value) {
          if (this.type === 'Provider' && (!value || value.length === 0)) {
            throw new Error('Services are required for Provider profiles');
          }
        }
      }
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
        isValidForProvider(value) {
          if (this.type === 'Provider' && value === null) {
            throw new Error('Rating is required for Provider profiles');
          }
        }
      }
    }
  }, {
    timestamps: true,
    tableName: 'profiles'
  });

  User.hasOne(Profile);
  Profile.belongsTo(User);

  Profile.hasMany(Rating, {
    as: 'userRatings',
    foreignKey: 'userProfileId',
    constraints: false,
    scope: {
      type: 'User'
    }
  });

  Profile.hasMany(Rating, {
    as: 'providerRatings',
    foreignKey: 'providerProfileId',
    constraints: false,
    scope: {
      type: 'Provider'
    }
  });

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
    User.belongsToMany(models.Service, {
      through: 'UserBookmarks',
      as: 'bookmarkedServices',
      foreignKey: 'userId'
    });
    User.hasMany(models.Booking, {
      foreignKey: 'userId',
      as: 'bookings',
    });
  };

  return { User, Profile };
};
