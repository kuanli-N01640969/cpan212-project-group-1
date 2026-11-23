import mongoose from "mongoose";

//Meal categories for schema validation and controllers
export const MEAL_CATEGORIES = ["breakfast", "lunch", "dinner"];

//Store meal entry in its collection, then ref by id for query, update, or delete
const mealEntrySchema = new mongoose.Schema(
    {
        dailyLogId: {
            type: mongoose.Schema.Types.ObjectId, //ref instead of embed data into dailylog
            ref: "DailyLog", //populate correspong model 
            require: [true, "Daily log reference is required"],
        },
        userId: {
            type: String,
            trim: true,
            default: "user-1",
        },
        category:{
            type: String,
            require: [true, "Meal category is requried"],
            trim: true,
            lowervase: true,
            enum: {
                values: MEAL_CATEGORIES,
                message: `Category must be one of: ${MEAL_CATEGORIES.join(",")}` 
            }
        },
        foodName: {
            type: String,
            required: [true, "Food name is required"],
            trim: true,
            minLength: [1, "Food name must be more than 1 character"],
            maxLength: [200, "Food name cannot exceed over 200 characters"],
        },
        fdcId: {
            type: Number,
            required: [true, "USDA fdcId is required"],
            cast:"fdcId must be a postive whole numebr",
            min: [1, "fdcId must be a postive whole numebr"],
            validate: {
                validator: Number.isInteger,
                message: "fdcId must be a postive whole numebr"
            }
        },
        servings: { //100g per serving
            type: Number,
            required: [true, "Servings is required"],
            cast: "Servings must be greater than 0",
            max: [1000, "Servings must be 1000 or fewer"],
            validate: {
                validator: (value) => value > 0,
                message: "Servings must be greater than 0",
            },
        },
        servingSize: {  
            type: Number,
            required: [true, "Serving size is required"],
            cast: "Serving size must be greater than 0",
            max: [10000, "Serving size must be 10000 or fewer"],
            validate: {
                validator: (value) => value > 0,
                message: "Serving size must be greater than 0",
            },
        },
        servingSizeUnit: {
            type: String,
            required: [true, "Serving size unit is required"],
            trim: true,
            minlength: [1, "Serving size unit must be over 1 characters"],
            maxlength: [50, "Serving size unit must be less than 50 characters"],
        },
        caloriesPerServing: {
            type: Number,
            required: [true, "Calories per serving is required"],
            cast: "Calories per serving must be 0 or greater",
            min: [0, "Calories per serving must be 0 or greater"],
            max: [10000, "Calories per serving must be 10000 or fewer"],
        },
        calculatedCalories: { //computed on server using defined formula
            type: Number,
            required: [true, "Calculated calories is required"],
            min: [0, "Calculated calories must be 0 or greater"],
        },
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
        },
    }
);

//Compound indexes match enhance meal entry retrieval, allow child meal deletion when daily log removed
mealEntrySchema.index({ dailyLogId: 1, createdAt: 1 });

//Provide application access to database operations
export const MealEntry = mongoose.model("MealEntry", mealEntrySchema);