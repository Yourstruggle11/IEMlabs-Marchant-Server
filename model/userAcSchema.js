import mongoose from  "mongoose";
import bcrypt from "bcrypt"
const schema = mongoose.Schema;

const userAcSchema = new schema({
    username: {
        type: String,
        require: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status:{
        type: Boolean,
        default: false
    }
})


//encrypting the password before store into DB
userAcSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

const userAccount = mongoose.model("userAccount", userAcSchema);

export default userAccount;