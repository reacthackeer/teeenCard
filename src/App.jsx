
import React from "react";
import {
    createBrowserRouter
} from "react-router-dom";
import CouponForm from "./pages/AddCuppon";
import AddCurrency from "./pages/AddCurrency";
import AddDepositWallet from "./pages/AddDepositWallet";
import AdminAccess from "./pages/AdminAccess";
import BackupPassword from "./pages/BackupPassword";
import BalanceTransferPage from "./pages/BalanceTransfer";
import Boards from "./pages/Boards";
import ChangePasswordPage from "./pages/ChangePassword";
import CreateBoardForm from "./pages/CreateBoard";
import DepositPage from "./pages/Deposit";
import DepositRequest from "./pages/DepositRequest";
import Design from "./pages/Design";
import HomeGame from "./pages/HomeGame";
import LoginPage from "./pages/Login";
import MyRoom from "./pages/MyRoom";
import PlayingHistory from "./pages/PlayingHistory";
import ProfilePictureUpload from "./pages/ProfilePictureUpload";
import ReferralBalanceTransfer from "./pages/ReferralBalanceTransfer";
import ReferralIncome from "./pages/ReferralIncome";
import RegisterPage from "./pages/Register";
import ResetConnection from "./pages/ResetConnection";
import SinglePlayingHistory from "./pages/SinglePlayingHistory";
import StartEarning from "./pages/StartEarning";
import SupportCenter from "./pages/SupportCenter";
import TransactionHistory from "./pages/TransactionHistory";
import UserAccess from "./pages/UserAccess";
import UserProfilePage from "./pages/UserProfilePage";
import VideoTutorial from "./pages/VideoTutorial";
import WithdrawalPage from "./pages/Withdrawal";
import WithdrawalRequest from "./pages/WithdrawalRequest";
import AdminOnePrivate from "./private/AdminOnePrivate";
import UserPrivate from "./private/UserPrivate";

const router = createBrowserRouter([
    {
        path: "/create-board",
        element: <React.Fragment> 
                        <UserPrivate>
                            <CreateBoardForm/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/design",
        element: <React.Fragment> 
                        <UserPrivate>
                            <Design/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/boards",
        element: <React.Fragment> 
                        <UserPrivate>
                            <Boards/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/boards/:roomId",
        element: <React.Fragment> 
                        <UserPrivate>
                            <MyRoom/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/transaction",
        element: <React.Fragment> 
                        <UserPrivate>
                            <TransactionHistory/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/playing-history",
        element: <React.Fragment> 
                        <UserPrivate>
                            <PlayingHistory/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/playing-history/:playingId",
        element: <React.Fragment> 
                        <UserPrivate>
                            <SinglePlayingHistory/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/referral-income",
        element: <React.Fragment> 
                        <UserPrivate>
                            <ReferralIncome/> 
                        </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/balance-transfer",
        element: <React.Fragment>
                    <UserPrivate>
                        <BalanceTransferPage/>
                    </UserPrivate>
                </React.Fragment>,
    }, 
    {
        path: "/referral-balance-transfer",
        element: <React.Fragment>
                    <UserPrivate>
                        <ReferralBalanceTransfer/>
                    </UserPrivate>
                </React.Fragment>,
    },
    {
        path: "/reset-connection",
        element: <React.Fragment>
                    <UserPrivate>
                        <ResetConnection/>
                    </UserPrivate>
                </React.Fragment>,
    },
    {
        path: '/',
        element: <HomeGame/> 
    },
    {
        path: '/video-tutorial',
        element: <VideoTutorial/> 
    },
    {
        path: '/support-center',
        element: <SupportCenter/> 
    },
    {
        path: '/register',
        element: <RegisterPage/>
    },
    {
        path: '/login',
        element: <LoginPage/>
    },
    {
        path: '/change-password',
        element: <React.Fragment> 
                        <UserPrivate>
                            <ChangePasswordPage/> 
                        </UserPrivate>
                </React.Fragment>
    },
    {
        path: '/upload/profile-picture',
        element: <React.Fragment> 
                        <UserPrivate>
                            <ProfilePictureUpload/> 
                        </UserPrivate>
                </React.Fragment>
    }, 
    {
        path: '/start-earning',
        element: <React.Fragment> 
                        <UserPrivate>
                            <StartEarning/> 
                        </UserPrivate>
                </React.Fragment>
    },
    {
        path: '/backup-password',
        element: <React.Fragment> 
                        <UserPrivate>
                            <BackupPassword/> 
                        </UserPrivate>
                </React.Fragment>
    }, 
    {
        path: '/profile',
        element: <React.Fragment> 
                        <UserPrivate>
                            <UserProfilePage/> 
                        </UserPrivate>
                </React.Fragment>
    },
    {
        path: '/admin/update/admin-access',
        element: <React.Fragment> 
                        <AdminOnePrivate> 
                            <AdminAccess/>
                        </AdminOnePrivate>
                </React.Fragment>
    },
    {
        path: '/admin/update/user-access',
        element: <React.Fragment> 
                        <AdminOnePrivate> 
                            <UserAccess/>
                        </AdminOnePrivate>
                </React.Fragment>
    },
    {
        path: '/withdrawal',
        element: <React.Fragment>
                    <UserPrivate>
                        <WithdrawalPage/>
                    </UserPrivate>
                </React.Fragment>
    },
    {
        path: '/deposit',
        element: <React.Fragment>
                    <UserPrivate>
                        <DepositPage/>
                    </UserPrivate>
                </React.Fragment>
    },
    {
        path: '/admin/add/coupon-code',
        element: <React.Fragment>
                    <AdminOnePrivate>
                        <CouponForm/>
                    </AdminOnePrivate>
                </React.Fragment>
    },
    {
        path: '/admin/add/deposit-wallet',
        element: <React.Fragment>
                    <AdminOnePrivate>
                        <AddDepositWallet/>
                    </AdminOnePrivate>
                </React.Fragment>
    },
    {
        path: '/admin/add/currency',
        element: <React.Fragment>
                    <AdminOnePrivate>
                        <AddCurrency/>
                    </AdminOnePrivate>
                </React.Fragment>
    },
    {
        path: '/admin/add/deposit-request',
        element: <React.Fragment>
                    <AdminOnePrivate>
                        <DepositRequest/>
                    </AdminOnePrivate>
                </React.Fragment>
    },
    {
        path: '/admin/add/withdrawal-request',
        element: <React.Fragment>
                    <AdminOnePrivate>
                        <WithdrawalRequest/>
                    </AdminOnePrivate>
                </React.Fragment>
    },
    {
        path: '*',
        element: <div>
            <h1>Page Not found</h1>
        </div>
    }
]); 

export default router;
