const {DataTypes} = require('sequelize'); 
const sequelize = require('../config/database');

const RootAsset = sequelize.define('rootAsset',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    realBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 100000000000
    },
    realCurrentBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 100000000000
    },
    realTotalCouponDeposit: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalWalletDeposit: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalWalletWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalAppCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalPartnerCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalCouponWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalAppCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    realTotalPartnerCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 100000000000
    },
    demoCurrentBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 100000000000
    },
    demoTotalCouponDeposit: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalWalletDeposit: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalWalletWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalAppCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalPartnerCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalCouponWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalAppCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    demoTotalPartnerCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 100000000000
    },
    offlineCurrentBalance: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 100000000000
    },
    offlineTotalCouponDeposit: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalWalletDeposit: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalWalletWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalAppCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalPartnerCommission: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalCouponWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalAppCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    },
    offlineTotalPartnerCommissionWithdrawal: {
        type: DataTypes.DECIMAL(20,4),
        allowNull: true,
        defaultValue: 0
    }
},{
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = RootAsset;