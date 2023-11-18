const bcrypt = require('bcryptjs');

async function hashPassword(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
        return {status__code: 200, password: hashedPassword, message: 'Successfully password hashed'}
  } catch (error) { 
        return { status__code: 500, message: error.message }
  }
}

async function comparePasswords(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        if (isMatch) {
            return {status__code: 200, message: 'Successfully logged in'};
        } else {
            return {status__code: 204, message: 'In correct password'};

        }
    } catch (error) { 
        return {
            status__code: 500, message: error.message
        }
    }
}


module.exports = { 
    hashPassword,
    comparePasswords
}