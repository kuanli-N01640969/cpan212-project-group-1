// Extracts the message and field-level details from our Express/Mongoose error JSON.
export async function createApiError(response, fallbackMessage) {
    let body = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    const message =
    body?.error?.message ||
    body?.message ||
    fallbackMessage;

    const details = Array.isArray(body?.error?.details)
    ? body.error.details
    : Array.isArray(body?.details)
        ? body.details
        : [];

    const error = new Error(message);
    error.status = response.status;
    error.details = details;
    return error;
}

// Converts [{ field, message }] into { [field]: message } for inline form rendering.
export function toFieldErrorMap(error) {
    const map = {};
    if (!Array.isArray(error?.details)) return map;

    for (const item of error.details) {
        if (item?.field && item?.message && !map[item.field]) {
            map[item.field] = item.message;
        }
    }
    return map;
}