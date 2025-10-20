export function formatDateTime(date: Date | number) {
	if (typeof date === "number") {
		return formatDateTime(new Date(date))
	}
	return date.toISOString();
}