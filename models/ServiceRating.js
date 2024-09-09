const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceRating = sequelize.define('ServiceRating', {
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
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
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
    tableName: 'service_ratings',
    hooks: {
      afterCreate: async (serviceRating, options) => {
        const { Service } = sequelize.models;
        const service = await Service.findByPk(serviceRating.serviceId);
        const allRatings = await ServiceRating.findAll({
          where: { serviceId: serviceRating.serviceId }
        });
        
        const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / allRatings.length;
        
        await service.update({ rating: averageRating }, options);
      },
      afterUpdate: async (serviceRating, options) => {
        const { Service } = sequelize.models;
        const service = await Service.findByPk(serviceRating.serviceId);
        const allRatings = await ServiceRating.findAll({
          where: { serviceId: serviceRating.serviceId }
        });
        
        const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / allRatings.length;
        
        await service.update({ rating: averageRating }, options);
      },
      afterDestroy: async (serviceRating, options) => {
        const { Service } = sequelize.models;
        const service = await Service.findByPk(serviceRating.serviceId);
        const allRatings = await ServiceRating.findAll({
          where: { serviceId: serviceRating.serviceId }
        });
        
        if (allRatings.length === 0) {
          await service.update({ rating: 0 }, options);
        } else {
          const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
          const averageRating = totalScore / allRatings.length;
          await service.update({ rating: averageRating }, options);
        }
      }
    }
  });

  ServiceRating.associate = (models) => {
    ServiceRating.belongsTo(models.Profile, {
      as: 'userProfile',
      foreignKey: 'userProfileId',
      constraints: false,
      scope: {
        type: 'User'
      }
    });

    ServiceRating.belongsTo(models.Service, {
      foreignKey: 'serviceId'
    });
  };

  return ServiceRating;
};
