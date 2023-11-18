const { uid } = require("uid");

const currencyUtils = {}; 
const {uid: uidNext} = require('uid');
currencyUtils.currencyGenerator = (commission, amount, txrId, adminId, refId, balanceType) => {
    let transactions = [];
    let currentBalance = Number(amount) / 100 * (100 - commission);
    let currentCommission = Number(amount) - currentBalance; 
        
        let depositTransaction = {
            typeName: 'DEPOSIT',
            isIn: 'in',
            amount: currentBalance,
            txrId: txrId.toLocaleUpperCase(),
            userId: adminId,
            sourceId: refId,
            balanceType
        } 
        
        let depositChargeTransaction = {
            typeName: 'DEPOSIT CHARGE',
            isIn: 'out',
            amount: currentCommission,
            txrId: txrId.toLocaleUpperCase(),
            userId: adminId,
            sourceId: refId,
            balanceType
        } 

        let commissionTransaction = {
            typeName: 'COMMISSION',
            isIn: 'in',
            amount: currentCommission,
            txrId: txrId.toLocaleUpperCase(),
            userId:  refId,
            sourceId: adminId,
            balanceType
        } 

        if(currentCommission > 0){
            transactions.push(depositTransaction);
            transactions.push(depositChargeTransaction)
            transactions.push(commissionTransaction)
        }else{
            transactions.push(depositTransaction);
            transactions.push(depositChargeTransaction)
        }
        return transactions;
}
currencyUtils.depositByCouponTransactionGenerator = (amount, type, adminId, refId) => {

    let txrId = uid(8);

    if(type === 'REAL'){
        let commission = global.realDepositFee;
        return currencyUtils.currencyGenerator(commission, amount, txrId, adminId, refId, 'REAL')
    }

    if(type === 'DEMO'){
        let commission = global.realDepositFee;
        return currencyUtils.currencyGenerator(commission, amount, txrId, adminId, refId, 'DEMO')
    }

    if(type === 'OFFLINE'){
        let commission = global.realDepositFee;
        return currencyUtils.currencyGenerator(commission, amount, txrId, adminId, refId, 'OFFLINE')
    } 
}
currencyUtils.registerAccountRootTransactionGenerator = (amount) => {
    let transaction = {
        demoTotalWalletWithdrawal: 0,
        demoCurrentBalance: 0,
        demoTotalCommission: 0,
        demoTotalAppCommission: 0,
        demoTotalPartnerCommission: 0
    };
    let depositFee = Number(process.env.demoDepositFee);
    if(depositFee > 0){
        transaction.demoTotalWalletWithdrawal = Number(amount);
        transaction.demoCurrentBalance = Number(amount);
        transaction.demoTotalCommission = (Number(amount) / 100) * (depositFee)
        transaction.demoTotalAppCommission = (Number(amount) / 100) * (depositFee / 2);
        transaction.demoTotalPartnerCommission = (Number(amount) / 100) * (depositFee / 2);
    }else{
        transaction.demoTotalWalletWithdrawal = Number(amount);
        transaction.demoCurrentBalance = Number(amount);
    }

    return transaction;
}
currencyUtils.registerAccountUserTransactionGenerator = (amount, registerUserID, referralId) => {
    let transactions = [];
    let depositFee = Number(process.env.demoDepositFee);
    let recentTxrId = currencyUtils.transactionIdGenerator();

    if(depositFee > 0){
        
        let inUserTransaction =  {
            typeName: 'WALLET DEPOSIT',
            isIn: 'IN',
            amount: amount,
            txrId: recentTxrId,
            userId: registerUserID,
            sourceId: referralId
        }
        let inUserTransactionUserCommission = {
            typeName: 'WALLET DEPOSIT COMMISSION',
            isIn: 'OUT',
            amount: (Number(amount) / 100) * depositFee,
            txrId: recentTxrId,
            userId: registerUserID,
            sourceId: referralId
        }
        let inUserTransactionRefCommission = {
            typeName: 'WALLET DEPOSIT COMMISSION',
            isIn: 'IN',
            amount: (Number(amount) / 100) * (depositFee / 2),
            txrId: recentTxrId,
            userId: referralId,
            sourceId: registerUserID
        }
        let inUserTransactionAppCommission = {
            typeName: 'WALLET DEPOSIT COMMISSION',
            isIn: 'IN',
            amount: (Number(amount) / 100) * (depositFee / 2),
            txrId: recentTxrId,
            userId: '999999999999',
            sourceId: registerUserID
        }
        transactions.push(inUserTransaction);
        transactions.push(inUserTransactionUserCommission);
        transactions.push(inUserTransactionRefCommission);
        transactions.push(inUserTransactionAppCommission); 
    }else{
        let inUserTransaction =  {
            typeName: 'WALLET DEPOSIT',
            isIn: 'IN',
            amount: amount,
            txrId: recentTxrId,
            userId: registerUserID,
            sourceId: referralId
        }
        transactions.push(inUserTransaction);
    }

    return transactions;
}
currencyUtils.transferBalanceTransactionGenerator = (amount, receiverId, referralId, userId) => {
    let transactions = [];
    let depositFee = Number(process.env.realDepositFee);
    let recentTxrId = currencyUtils.transactionIdGenerator();
    let increment = amount;
    if(depositFee > 0){
        
        let inUserTransaction =  {
            typeName: 'BALANCE TRANSFER',
            isIn: 'IN',
            amount: Number(amount),
            txrId: recentTxrId,
            userId: receiverId,
            sourceId: userId,
            balanceType:"REAL"
        }
        let senderTransaction =  {
            typeName: 'BALANCE TRANSFER',
            isIn: 'OUT',
            amount: amount,
            txrId: recentTxrId,
            userId: userId,
            sourceId: receiverId,
            balanceType:"REAL"
        }
        let inUserTransactionUserCommission = {
            typeName: 'BALANCE TRANSFER COMMISSION',
            isIn: 'OUT',
            amount: (Number(amount) / 100) * depositFee,
            txrId: recentTxrId,
            userId: receiverId,
            sourceId: userId,
            balanceType:"REAL"
        }
        let inUserTransactionRefCommission = {
            typeName: 'BALANCE TRANSFER COMMISSION',
            isIn: 'IN',
            amount: (Number(amount) / 100) * (depositFee / 2),
            txrId: recentTxrId,
            userId: referralId,
            sourceId: receiverId,
            balanceType:"REAL"
        }
        let inUserTransactionAppCommission = {
            typeName: 'BALANCE TRANSFER COMMISSION',
            isIn: 'IN',
            amount: (Number(amount) / 100) * (depositFee / 2),
            txrId: recentTxrId,
            userId: '999999999999',
            sourceId: receiverId ,
            balanceType:"REAL"
        }
        transactions.push(senderTransaction);
        transactions.push(inUserTransaction);
        transactions.push(inUserTransactionUserCommission);
        transactions.push(inUserTransactionRefCommission);
        transactions.push(inUserTransactionAppCommission); 
        increment = inUserTransaction.amount - inUserTransactionUserCommission.amount;
    }else{
        let inUserTransaction =  {
            typeName: 'BALANCE TRANSFER',
            isIn: 'IN',
            amount: amount,
            txrId: recentTxrId,
            userId: receiverId,
            sourceId: userId,
            balanceType:"REAL"
        }
        let senderTransaction =  {
            typeName: 'BALANCE TRANSFER',
            isIn: 'OUT',
            amount: amount,
            txrId: recentTxrId,
            userId: userId,
            sourceId: receiverId,
            balanceType:"REAL"
        }
        transactions.push(senderTransaction);
        transactions.push(inUserTransaction);
    }

    return {transactions,increment};
}
currencyUtils.couponRootAssetUpdate = (amount, balanceType, walletType) => {
    let demoDepositFee =  process.env.demoDepositFee;
    let realDepositFee =  process.env.realDepositFee;
    let offlineDepositFee =  process.env.offlineDepositFee; 
    let currencyAssetArray = {demoDepositFee: Number(demoDepositFee), realDepositFee: Number(realDepositFee), offlineDepositFee: Number(offlineDepositFee)};
    let rootAssetUpdate = {
        [balanceType.toLowerCase()+`Total${walletType}Withdrawal`]: amount,
        [balanceType.toLowerCase()+'CurrentBalance']: -amount,
        [balanceType.toLowerCase()+'TotalCommission']: 0,
        [balanceType.toLowerCase()+'TotalAppCommission']: 0,
        [balanceType.toLowerCase()+'TotalPartnerCommission']: 0,
    } 
    if(currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] > 0){
        rootAssetUpdate[balanceType.toLowerCase()+`TotalCommission`] = (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'])
        rootAssetUpdate[balanceType.toLowerCase()+`TotalAppCommission`] = (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] / 2)
        rootAssetUpdate[balanceType.toLowerCase()+`TotalPartnerCommission`] = (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] / 2)
    }
    return rootAssetUpdate; 
}

currencyUtils.couponRootAssetUpdateDeposit = (amount, balanceType, walletType) => {
    let demoDepositFee =  process.env.demoDepositFee;
    let realDepositFee =  process.env.realDepositFee;
    let offlineDepositFee =  process.env.offlineDepositFee; 
    let currencyAssetArray = {demoDepositFee: Number(demoDepositFee), realDepositFee: Number(realDepositFee), offlineDepositFee: Number(offlineDepositFee)};
    let rootAssetUpdate = {
        [balanceType.toLowerCase()+`Total${walletType}Deposit`]: amount,
        [balanceType.toLowerCase()+'CurrentBalance']: amount,
        [balanceType.toLowerCase()+'TotalCommission']: 0,
        [balanceType.toLowerCase()+'TotalAppCommission']: 0,
        [balanceType.toLowerCase()+'TotalPartnerCommission']: 0,
    } 
    if(currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] > 0){
        rootAssetUpdate[balanceType.toLowerCase()+`TotalCommission`] = (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'])
        rootAssetUpdate[balanceType.toLowerCase()+`TotalAppCommission`] = (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] / 2)
        rootAssetUpdate[balanceType.toLowerCase()+`TotalPartnerCommission`] = (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] / 2)
    }
    return rootAssetUpdate; 
}



currencyUtils.couponRootAssetUserTransactionGenerator = (amount, balanceType, registerUserID, referralId) => {
    let demoDepositFee =  process.env.demoDepositFee;
    let realDepositFee =  process.env.realDepositFee;
    let offlineDepositFee =  process.env.offlineDepositFee; 
    let currencyAssetArray = {demoDepositFee: Number(demoDepositFee), realDepositFee: Number(realDepositFee), offlineDepositFee: Number(offlineDepositFee)};
    let recentTxrId = currencyUtils.transactionIdGenerator();
    let transactions = [];
    let inUserTransaction =  {
        typeName: 'WALLET WITHDRAWAL',
        isIn: 'OUT',
        amount: amount,
        txrId: recentTxrId,
        userId: registerUserID,
        sourceId: referralId,
        balanceType: balanceType.toUpperCase()
    }
    transactions.push(inUserTransaction);
    if(currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] > 0){
        let inUserTransactionUserCommission = {
            typeName: 'WALLET WITHDRAWAL COMMISSION',
            isIn: 'OUT',
            amount: (Number(amount) / 100) * currencyAssetArray[balanceType.toLowerCase()+'DepositFee'],
            txrId: recentTxrId,
            userId: registerUserID,
            sourceId: referralId,
            balanceType: balanceType.toUpperCase()
        }
        transactions.push(inUserTransactionUserCommission);

        let inUserTransactionRefCommission = {
            typeName: 'WALLET WITHDRAWAL COMMISSION',
            isIn: 'IN',
            amount: (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] / 2),
            txrId: recentTxrId,
            userId: referralId,
            sourceId: registerUserID,
            balanceType:  balanceType.toUpperCase()
        }

        transactions.push(inUserTransactionRefCommission)

        let inUserTransactionAppCommission = {
            typeName: 'WALLET WITHDRAWAL COMMISSION',
            isIn: 'IN',
            amount: (Number(amount) / 100) * (currencyAssetArray[balanceType.toLowerCase()+'DepositFee'] / 2),
            txrId: recentTxrId,
            userId: '999999999999',
            sourceId: registerUserID,
            balanceType:  balanceType.toUpperCase()
        }
        
        transactions.push(inUserTransactionAppCommission);
    }

    let newTransaction = {};
    if(transactions.length === 1){
        newTransaction.array = transactions;
        newTransaction.increment = amount
    }else{
        newTransaction.array = transactions;
        newTransaction.increment = transactions[0].amount - transactions[1].amount
    } 
    newTransaction.increment.toFixed(30);
    return newTransaction; 
}


currencyUtils.transactionIdGenerator = () => {
    let currentTxr = uidNext(8).toUpperCase();
    return currentTxr;
}
module.exports = {
    currencyUtils
}
 
// Linux (most distributions except Alpine), ARM64
// Linux (Arch Linux), x86_64
// Linux (Linux Mint), x86_64
// Linux (Fedora), x86_64
// Linux (CentOS), x86_64
// Linux (Ubuntu), x86_64
// Linux (Debian), x86_64
// Linux (Alpine)