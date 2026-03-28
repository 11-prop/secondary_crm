export function formatCustomerName(customer) {
    return [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "Unnamed customer";
}

export function formatCustomerInitials(customer) {
    const name = formatCustomerName(customer);
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
}

export function formatDateLabel(value, withTime = false) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    }).format(date);
}

export function formatCurrency(value, currency = "AED") {
    if (value === null || value === undefined || value === "") {
        return "Not priced";
    }

    const number = Number(value);
    if (Number.isNaN(number)) {
        return "Not priced";
    }

    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(number)} ${currency}`;
}

export function getClientTypeClasses(type) {
    switch (type) {
        case "Buyer":
            return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
        case "Seller":
            return "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100";
        case "Both":
            return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
        default:
            return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    }
}

export function getAgentTypeClasses(type) {
    switch (type) {
        case "Buyer":
            return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
        case "Seller":
            return "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100";
        default:
            return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
}

export function getPropertyStatusClasses(status) {
    switch (status) {
        case "Active Listing":
            return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
        case "Rented":
            return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
        case "Primary Residence":
            return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
        default:
            return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
}

export function getPropertyAttributeTags(property) {
    const tags = [];

    if (property?.is_beach) {
        tags.push("Beachfront");
    }
    if (property?.is_corner) {
        tags.push("Corner");
    }
    if (property?.is_lake_front) {
        tags.push("Lake-front");
    }
    if (property?.is_park_front) {
        tags.push("Park-front");
    }
    if (property?.is_market) {
        tags.push("Market-facing");
    }

    return tags;
}
