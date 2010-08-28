
UserValidator = {
    check : function(user, options) {
        var errors = [];
        options = options || { verifyPassword : true };

        if(!user.username || user.username.length <= 3) {
            errors.push("Username empty or less than 3 characters.");
        }

        if(!user.zipcode || user.zipcode.length < 5) {
            errors.push("Zipcode empty or less than 5 characters");
        }

        if(!user.password) {
            errors.push("Password is not defined.");
        }

        if(options.verifyPassword) {
            if(user.password != user.verify) {
                errors.push("Passwords do not match.");
            }
        }

        if(!user.email) {
            errors.push("Email address not defined.");
        }

        if(!user.fullname) {
            errors.push("Full name not defined.");
        }

        return errors;
    }
};

exports.UserValidator = UserValidator;