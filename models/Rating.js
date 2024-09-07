const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rating = sequelize.define('Rating', {
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id'
      }
    },
    providerProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id'
      }
    },
    likedByUserIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      defaultValue: []
    }
  }, {
    timestamps: true,
    tableName: 'ratings',
    hooks: {
      afterCreate: async (rating, options) => {
        const { Profile } = sequelize.models;
        const providerProfile = await Profile.findByPk(rating.providerProfileId);
        const allRatings = await Rating.findAll({
          where: { providerProfileId: rating.providerProfileId }
        });
        
        const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / allRatings.length;
        
        await providerProfile.update({ rating: averageRating }, options);
      },
      afterUpdate: async (rating, options) => {
        const { Profile } = sequelize.models;
        const providerProfile = await Profile.findByPk(rating.providerProfileId);
        const allRatings = await Rating.findAll({
          where: { providerProfileId: rating.providerProfileId }
        });
        
        const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / allRatings.length;
        
        await providerProfile.update({ rating: averageRating }, options);
      },
      afterDestroy: async (rating, options) => {
        const { Profile } = sequelize.models;
        const providerProfile = await Profile.findByPk(rating.providerProfileId);
        const allRatings = await Rating.findAll({
          where: { providerProfileId: rating.providerProfileId }
        });
        
        if (allRatings.length === 0) {
          await providerProfile.update({ rating: 0 }, options);
        } else {
          const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
          const averageRating = totalScore / allRatings.length;
          await providerProfile.update({ rating: averageRating }, options);
        }
      }
    }
  });

  Rating.associate = (models) => {
    Rating.belongsTo(models.Profile, {
      as: 'userProfile',
      foreignKey: 'userProfileId',
      constraints: false,
      scope: {
        type: 'User'
      }
    });

    Rating.belongsTo(models.Profile, {
      as: 'providerProfile',
      foreignKey: 'providerProfileId',
      constraints: false,
      scope: {
        type: 'Provider'
      }
    });
  };

  return Rating;
};
