import { registerUser, loginUser, logoutUser } from "../services/auth.js";
import { ONE_DAY } from '../constants/index.js';
import { refreshUsersSession } from '../services/auth.js';

// export const findUserByEmail = async (email) => {
//     try {
//         const user = await User.findOne({ email });
//         return user;
//     } catch (error) {
//         throw new Error('Error finding user by email');
//     }
// };


export const registerUserController = async (req, res, next) => {
    try {
        const { email } = req.body;

        // const existingUser = await findUserByEmail(email);

        const user = await registerUser(req.body);

        res.json({
            status: 200,
            message: 'Successfully registered a user!',
            data: user,
        });
    } catch(error) {   
        next(error);
    }
};

export const loginUserController = async (req, res) => {
    const session = await loginUser(req.body);

    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });

    res.json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const logoutUserController = async (req, res) => {
    if (req.cookies.sessionId) {
        await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.status(204).send();
};

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });
};

export const refreshUserSessionController = async (req, res) => {
    const session = await refreshUsersSession({
        sessionId: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
    });

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: {
            accessToken: session.accessToken,
        },
    });
};