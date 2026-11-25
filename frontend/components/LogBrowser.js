import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAllLogs, createLog, deleteLog } from "../services/logApi";
import { toFieldErrorMap } from "../services/apiError";

const ERROR_TEXT_STYLE = { color: "#b91c1c", fontSize: "0.9rem", marginTop: "4px" };
const CONTROLS_ROW_STYLE = { display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" };

//Safely reads a single string param from Next.js router.query
function readParam(value, fallback = "") {
    if (Array.isArray(value)) return value[0] || fallback;
    return typeof value === "string" ? value : fallback;
}

export default function LogBrowser({ selectedLog, onSelectLog, refreshKey }) {
    const router = useRouter();

    // URL-synced query parameters (source of truth for API requests)
    const fromParam = readParam(router.query.from);
    const toParam = readParam(router.query.to);
    const minCalParam = readParam(router.query.minCalories);
    const maxCalParam = readParam(router.query.maxCalories);
    const sortParam = readParam(router.query.sort, "-date");
    const pageParam = readParam(router.query.page, "1");
    const limitParam = readParam(router.query.limit, "10");

    //Controlled filter inputs synced with the URL
    const [fromInput, setFromInput] = useState("");
    const [toInput, setToInput] = useState("");
    const [minCalInput, setMinCalInput] = useState("");
    const [maxCalInput, setMaxCalInput] = useState("");
    const [sortInput, setSortInput] = useState("-date");
    const [limitInput, setLimitInput] = useState("10");

    //Paginated list state
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [reloadTick, setReloadTick] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [queryFieldErrors, setQueryFieldErrors] = useState({});

    //Create new daily log form state
    const [newLogDate, setNewLogDate] = useState(() => new Date().toLocaleDateString("en-CA"));
    const [newLogGoal, setNewLogGoal] = useState("2000");
    const [createMessage, setCreateMessage] = useState("");
    const [createFieldErrors, setCreateFieldErrors] = useState({});

    //Sync filter inputs when URL changes (first load, refresh, or Back/Forward)
    useEffect(() => {
        if (!router.isReady) return;
        setFromInput(fromParam);
        setToInput(toParam);
        setMinCalInput(minCalParam);
        setMaxCalInput(maxCalParam);
        setSortInput(sortParam);
        setLimitInput(limitParam);
    }, [router.isReady, fromParam, toParam, minCalParam, maxCalParam, sortParam, limitParam]);

    // Updates URL query params cleanly without reloading the page
    function pushQuery(nextParams) {
        const cleanQuery = {};
        for (const [key, value] of Object.entries(nextParams)) {
            if (value !== undefined && value !== null && String(value).trim() !== "") {
            cleanQuery[key] = String(value).trim();
            }
        }

        router.push(
            { pathname: router.pathname, query: cleanQuery },
            undefined,
            { shallow: true }
        );
    }

    //Fetch filtered, sorted, paginated logs from MongoDB via Express API
    useEffect(() => {
        if (!router.isReady) return;
        let cancelled = false;

    async function loadLogs() {
        setLoading(true);
        setError("");
        setQueryFieldErrors({});

        try {
        const result = await getAllLogs({
            from: fromParam,
            to: toParam,
            minCalories: minCalParam,
            maxCalories: maxCalParam,
            sort: sortParam,
            page: pageParam,
            limit: limitParam,
        });

        if (cancelled) return;

        const fetchedLogs = result.data || [];
        setLogs(fetchedLogs);
        setPagination({
            page: result.page ?? 1,
            limit: result.limit ?? 10,
            total: result.total ?? fetchedLogs.length,
            totalPages: result.totalPages ?? 0,
            hasNextPage: Boolean(result.hasNextPage),
            hasPrevPage: Boolean(result.hasPrevPage),
        });

        // Keep the current selection if it is still on this page; otherwise select the first log
        onSelectLog((current) => {
            if (fetchedLogs.length === 0) return null;
            const stillPresent = current && fetchedLogs.find((item) => item._id === current._id);
            return stillPresent || fetchedLogs[0];
        });
        } catch (err) {
            if (cancelled) return;
            setError(err.message);
            setQueryFieldErrors(toFieldErrorMap(err));
        } finally {
            if (!cancelled) setLoading(false);
        }
    }

    loadLogs();
    return () => {
        cancelled = true;
    };
    }, [
        router.isReady,
        fromParam,
        toParam,
        minCalParam,
        maxCalParam,
        sortParam,
        pageParam,
        limitParam,
        reloadTick,
        refreshKey,
        onSelectLog,
    ]);

    // Applying filters resets to page 1 so users don't get stranded on an empty page
    function handleApplyFilters(event) {
        event.preventDefault();
        pushQuery({
            from: fromInput,
            to: toInput,
            minCalories: minCalInput,
            maxCalories: maxCalInput,
            sort: sortInput,
            limit: limitInput,
            page: "1",
        });
    }

    function handleResetFilters() {
        pushQuery({});
    }

    function handlePageChange(nextPage) {
        pushQuery({
            from: fromParam,
            to: toParam,
            minCalories: minCalParam,
            maxCalories: maxCalParam,
            sort: sortParam,
            limit: limitParam,
            page: String(nextPage),
        });
    }

    async function handleCreateLog(event) {
        event.preventDefault();
        setCreateMessage("");
        setCreateFieldErrors({});

        try {
            const parsedGoal = newLogGoal.trim() === "" ? "" : Number(newLogGoal);
            const created = await createLog(newLogDate.trim(), parsedGoal);

            onSelectLog(created);
            setCreateMessage(`Created daily log for ${created.date}!`);
            setReloadTick((t) => t + 1);
        } catch (err) {
            setCreateFieldErrors(toFieldErrorMap(err));
            setCreateMessage(err.message);
        }
    }

    async function handleDeleteLog(logId) {
        try {
            await deleteLog(logId);

            if (selectedLog?._id === logId) {
                onSelectLog(null);
            }

            if (logs.length === 1 && pagination.page > 1) {
                handlePageChange(pagination.page - 1);
            } else {
                setReloadTick((t) => t + 1);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <>
            <div className="logSection">
                <h3>Browse Daily Logs</h3>

                <form onSubmit={handleApplyFilters} noValidate style={CONTROLS_ROW_STYLE}>
                <div>
                    <label htmlFor="filter-from">From Date</label>
                    <br />
                    <input
                    id="filter-from"
                    type="date"
                    value={fromInput}
                    onChange={(e) => setFromInput(e.target.value)}
                    />
                    {queryFieldErrors.from && <p style={ERROR_TEXT_STYLE}>{queryFieldErrors.from}</p>}
                </div>

                <div>
                    <label htmlFor="filter-to">To Date</label>
                    <br />
                    <input
                    id="filter-to"
                    type="date"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    />
                    {queryFieldErrors.to && <p style={ERROR_TEXT_STYLE}>{queryFieldErrors.to}</p>}
                </div>

                <div>
                    <label htmlFor="filter-min-cal">Min Goal</label>
                    <br />
                    <input
                    id="filter-min-cal"
                    type="number"
                    placeholder="e.g. 1800"
                    value={minCalInput}
                    onChange={(e) => setMinCalInput(e.target.value)}
                    />
                    {queryFieldErrors.minCalories && (
                    <p style={ERROR_TEXT_STYLE}>{queryFieldErrors.minCalories}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="filter-max-cal">Max Goal</label>
                    <br />
                    <input
                    id="filter-max-cal"
                    type="number"
                    placeholder="e.g. 2500"
                    value={maxCalInput}
                    onChange={(e) => setMaxCalInput(e.target.value)}
                    />
                    {queryFieldErrors.maxCalories && (
                    <p style={ERROR_TEXT_STYLE}>{queryFieldErrors.maxCalories}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="filter-sort">Sort By</label>
                    <br />
                    <select
                    id="filter-sort"
                    value={sortInput}
                    onChange={(e) => setSortInput(e.target.value)}
                    >
                    <option value="-date">Date (Newest First)</option>
                    <option value="date">Date (Oldest First)</option>
                    <option value="-targetCalories">Calorie Goal (High to Low)</option>
                    <option value="targetCalories">Calorie Goal (Low to High)</option>
                    <option value="-createdAt">Created (Newest First)</option>
                    </select>
                    {queryFieldErrors.sort && <p style={ERROR_TEXT_STYLE}>{queryFieldErrors.sort}</p>}
                </div>

                <div>
                    <label htmlFor="filter-limit">Per Page</label>
                    <br />
                    <select
                    id="filter-limit"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    </select>
                    {queryFieldErrors.limit && <p style={ERROR_TEXT_STYLE}>{queryFieldErrors.limit}</p>}
                </div>

                <button type="submit">Apply</button>
                <button type="button" onClick={handleResetFilters}>
                    Reset
                </button>
                </form>

                {error && <p style={ERROR_TEXT_STYLE}>{error}</p>}
                {loading && <p>Loading daily logs...</p>}

                {!loading && logs.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                    {logs.map((log) => {
                    const isActive = selectedLog?._id === log._id;
                    return (
                        <div
                        className="mealItem"
                        key={log._id}
                        style={isActive ? { fontWeight: "bold" } : undefined}
                        >
                        <span>
                            {log.date} — Goal: {log.targetCalories} cal {isActive ? "(Active)" : ""}
                        </span>

                        <div className="mealButtons">
                            <button type="button" onClick={() => onSelectLog(log)}>
                            {isActive ? "Selected" : "Select"}
                            </button>
                            <button type="button" onClick={() => handleDeleteLog(log._id)}>
                            Delete
                            </button>
                        </div>
                        </div>
                    );
                    })}

                    <div style={{ ...CONTROLS_ROW_STYLE, marginTop: "12px", alignItems: "center" }}>
                    <button
                        type="button"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => handlePageChange(pagination.page - 1)}
                    >
                        Previous
                    </button>

                    <span>
                        Page {pagination.page} of {Math.max(pagination.totalPages, 1)} ({pagination.total}{" "}
                        total logs)
                    </span>

                    <button
                        type="button"
                        disabled={!pagination.hasNextPage}
                        onClick={() => handlePageChange(pagination.page + 1)}
                    >
                        Next
                    </button>
                    </div>
                </div>
                )}

                {!loading && logs.length === 0 && !error && (
                <p>No daily logs match the current filters.</p>
                )}
            </div>

            <div className="logSection">
                <h3>Create New Daily Log</h3>

                <form onSubmit={handleCreateLog} noValidate style={CONTROLS_ROW_STYLE}>
                <div>
                    <label htmlFor="new-log-date">Date (YYYY-MM-DD)</label>
                    <br />
                    <input
                    id="new-log-date"
                    type="date"
                    value={newLogDate}
                    onChange={(e) => setNewLogDate(e.target.value)}
                    />
                    {createFieldErrors.date && <p style={ERROR_TEXT_STYLE}>{createFieldErrors.date}</p>}
                </div>

                <div>
                    <label htmlFor="new-log-goal">Target Calories (1–5000)</label>
                    <br />
                    <input
                    id="new-log-goal"
                    type="number"
                    placeholder="e.g. 2000"
                    value={newLogGoal}
                    onChange={(e) => setNewLogGoal(e.target.value)}
                    />
                    {createFieldErrors.targetCalories && (
                    <p style={ERROR_TEXT_STYLE}>{createFieldErrors.targetCalories}</p>
                    )}
                </div>

                <button type="submit">Create Log</button>
                </form>

                {createMessage && (
                <p style={Object.keys(createFieldErrors).length > 0 ? ERROR_TEXT_STYLE : undefined}>
                    {createMessage}
                </p>
                )}
            </div>
        </>
    );
}