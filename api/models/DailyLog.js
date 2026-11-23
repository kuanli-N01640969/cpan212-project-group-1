import mongoose from "mongoose";

//Date validation, rejects bad formats or out of range data
function isRealCalendarDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {  
        return false;
    }
    const parsed = new Date(`${value}T00:00:00Z`); //universal UTC
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0,10) === value; //prevent auto adjustmnet
}

//Define structure and validation rules for daily log
const dailyLogSchema = new mongoose.Schema(
    {
        //Temporary user ID until M5 Authentication
        userId: {
            type: String,
            trim: true,
            default: "user-1",
        },
        date: {
            type: String,
            require: [true, "Date is requried"],
            trim: true,
            validate: {
                validator: isRealCalendarDate,
                message: "Date must be real calendar date in YYYY-MM-DD."
            },
        },
        targetCalories: {
            type: Number,
            require: [true, "Target calories is required"],
            cast: "Target calories must be between 1-5000", //modify default error msg
            min: [1, "Target calories must be more than 1"],
            max: [5000, "Target calories must be less than 5000"],
            validate: {
                validator: Number.isInteger,
                message: "Target calories must be whole number"
            },
        },
    },
    {
        //Manages ceate and update log timestamps 
        timestamps: true,
        toJSON: {
            //hide internal version while keeping _id for frontend compatibility
            versionKey: false,
        },
    }
);

//Compound indexes match enhance daily logs retrieval 
dailyLogSchema.index({date: 1, _id: 1});
dailyLogSchema.index({targetCalories: 1, _id: 1});
dailyLogSchema.index({createdAt: 1, _id: 1});

//Provide application access to database operations
export const DailyLog = mongoose.model("DailyLog", dailyLogSchema);