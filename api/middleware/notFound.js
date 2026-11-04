// Runs only when no route above it matched the request.
// Export function
export function notFound(req, res) {
    //sets the status and then returns the JSON
    res.status(404).json({
        //req method is for how the client tried reach server and path is where they attempted to go
        error: `No route for ${req.method} ${req.path}`
    });
    }

    //notFound: Catches anything that doesn't match a route (404).