const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProviderRating = sequelize.define('ProviderRating', {
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
  }, {
    timestamps: true,
    tableName: 'provider_ratings',
    hooks: {
      afterCreate: async (providerRating, options) => {
        const { Profile } = sequelize.models;
        const providerProfile = await Profile.findByPk(providerRating.providerProfileId);
        const allRatings = await ProviderRating.findAll({
          where: { providerProfileId: providerRating.providerProfileId }
        });
        
        const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / allRatings.length;
        
        await providerProfile.update({ rating: averageRating }, options);
      },
      afterUpdate: async (providerRating, options) => {
        const { Profile } = sequelize.models;
        const providerProfile = await Profile.findByPk(providerRating.providerProfileId);
        const allRatings = await ProviderRating.findAll({
          where: { providerProfileId: providerRating.providerProfileId }
        });
        
        const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / allRatings.length;
        
        await providerProfile.update({ rating: averageRating }, options);
      },
      afterDestroy: async (providerRating, options) => {
        const { Profile } = sequelize.models;
        const providerProfile = await Profile.findByPk(providerRating.providerProfileId);
        const allRatings = await ProviderRating.findAll({
          where: { providerProfileId: providerRating.providerProfileId }
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

  ProviderRating.associate = (models) => {
    ProviderRating.belongsTo(models.Profile, {
      as: 'userProfile',
      foreignKey: 'userProfileId',
      constraints: false,
      scope: {
        type: 'User'
      }
    });

    ProviderRating.belongsTo(models.Profile, {
      as: 'providerProfile',
      foreignKey: 'providerProfileId',
      constraints: false,
      scope: {
        type: 'Provider'
      }
    });
  };

  return ProviderRating;
};
