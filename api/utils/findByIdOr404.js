import mongoose from "mongoose";
import { HttpError } from "./http-error.js";

//Retrieve MongoDB document by ID and return, tthrow a 404 error if doc does not exist
export async function findByIdOr404(Model, id, label) {
    //id format validation
    if (!mongoose.isObjectIdOrHexString(id)) {
        throw new HttpError(404, `${label} with ID ${id} not found`);
    }

    //Document retrieval after id format validated
    const document = await Model.findById(id); 

    //Valid id, but doc does not exist
    if (!document) {
        throw new HttpError(404, `${label} with ID ${id} not found`);
    }
    return document;
}
