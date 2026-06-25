/**
 * KCS Utility Module: DateUtil
 * ------------------------------------------------------------
 * This module standardises all date and time formatting across the
 * admin portal. Prefer these helpers instead of `new Date()` math or
 * `toLocaleString` calls sprinkled throughout feature code. They keep
 * daylight-saving quirks, serialisation, and string formatting
 * consistent with the server.
 *
 * Key helpers
 *  - DateUtil.ToShortDate(dateLike)      -> "M/D/YYYY"
 *  - DateUtil.ToShortTime(dateLike)      -> "h:mm AM" style strings
 *  - DateUtil.ToShortDateTime(dateLike)  -> combines the two for UI labels
 *  - DateUtil.UTCToLocal(dateLike)       -> converts API UTC payloads into
 *                                           local Date objects without double
 *                                           shifting pure date values
 *  - DateUtil.AddDays(date, days)        -> safe arithmetic that returns a
 *                                           new Date instance
 *
 * Usage example – render a search filter summary:
 * ```js
 * const [rangeStart, rangeEnd] = GetThisWeek();
 * _$("lblDateRange").setText(
 *     `${DateUtil.ToShortDate(rangeStart)} - ${DateUtil.ToShortDate(rangeEnd)}`
 * );
 * ```
 *
 * Usage example – process an API payload that ships UTC stamps:
 * ```js
 * const appointment = JsonMethod.callSync("/Appointments.aspx", "Get", { id });
 * const localStart = DateUtil.UTCToLocal(appointment.StartUtc);
 * _$("lblStart").setText(DateUtil.ToShortDateTime(localStart));
 * ```
 */
function DateToShortString(oDate) {
	return DateUtil.ToShortDate(oDate);
}


var DateUtil = {
	ToShortTime: function (dt) {
		dt = new Date(dt);
		let iHour = dt.getHours() > 12 ? dt.getHours() - 12 : dt.getHours();
		iHour = iHour == 0 ? 12 : iHour;
		return iHour.toString() + ":" + (dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()) + " " + (dt.getHours() >= 12 ? "PM" : "AM");
	},

	ToShortDate: function (oDate) {
		oDate = new Date(oDate);
		return (oDate.getMonth() + 1) + "/" + oDate.getDate() + "/" + oDate.getFullYear().toString();
	},

	ToShortDateTime: function (oDate) {
		return DateUtil.ToShortDate(oDate) + " " + DateUtil.ToShortTime(oDate);
	},

	// Replace the AddDays/AddHours/AddMonths/AddYears in the DateUtil literal with:

	AddDays: function (oDate, iDays) {
		const d = new Date(oDate);
		d.setDate(d.getDate() + iDays);
		return d;
	},

	AddHours: function (oDate, iHours) {
		const d = new Date(oDate);
		d.setTime(d.getTime() + (iHours * 60 * 60 * 1000));
		return d;
	},

	AddMonths: function (oDate, iMonths) {
		const d = new Date(oDate);
		const m = d.getMonth() + iMonths;
		const y = d.getFullYear() + Math.trunc(m / 12);
		const newMonth = ((m % 12) + 12) % 12;
		// clamp the day to end of target month
		const lastDay = new Date(y, newMonth + 1, 0).getDate();
		d.setFullYear(y, newMonth, Math.min(d.getDate(), lastDay));
		return d;
	},

	AddYears: function (oDate, iYears) {
		const d = new Date(oDate);
		const targetMonth = d.getMonth();
		d.setFullYear(d.getFullYear() + iYears);
		// clamp for Feb 29 → Feb 28 etc.
		if (d.getMonth() !== targetMonth) d.setDate(0);
		return d;
	},


	AdvanceToDayMax: function (oDate) {
		oDate = new Date(oDate);
		oDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), 23, 59, 59, 999);
		return oDate;
	},

	AreEqual: function (oDate1, oDate2) {
		oDate1 = new Date(oDate1);
		oDate2 = new Date(oDate2);

		return (oDate1.toUTCString() == oDate2.toUTCString());
	},

	LocalToUTC: function (date) {
		return new Date(new Date(date).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
	},

	UTCToLocal: function (sDate) {
		let date = new Date(sDate);

		//If this was serialized as a Date Only then it doesn't need to be converted
		if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0)
			return date;

		return new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
	},

	IsDateOnly(date) {
		return (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0);
	},

	Format_yyyy_MM_dd(date) {
		// Get the year, month, and day components of the date
		if (ObjectUtil.GetType(date) == 'string')
			date = new Date(date);
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1 and pad with zeros if needed
		const day = String(date.getUTCDate()).padStart(2, '0'); // Pad with zeros if needed

		// Combine the components to form the formatted date
		const formattedDate = `${year}-${month}-${day}`;

		return formattedDate;
	},

	DaysBetween(date1, date2) {
		if (ObjectUtil.GetType(date1) === 'string')
			date1 = new Date(date1);

		if (ObjectUtil.GetType(date2) === 'string')
			date2 = new Date(date2);

		if (isNaN(new Date(date1).getTime()) || isNaN(new Date(date2).getTime()))
			return 0;

		// Convert the dates to UTC to ensure consistent calculation across time zones
		const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
		const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

		// Calculate the difference in milliseconds
		const timeDifference = utcDate2 - utcDate1;

		// Convert the difference to days
		const daysDifference = Math.abs(Math.floor(timeDifference / (1000 * 60 * 60 * 24)));

		return daysDifference;
	},

        IsValidDate(sDate) {
                if (!sDate)
                        return false;

                const date = new Date(sDate);

                // Check if the date is valid
                return !isNaN(date.getTime());
        },

        /**
         * Parse a follow-up input ("2025-01-10", "2025-01-10T13:45", or locale strings) into a Date.
         * Usage: const parsed = DateUtil.ParseFollowUpDate(rawValue);
         */
        ParseFollowUpDate(rawValue) {
                const str = (rawValue || "").trim();
                if (!str) return null;

                const compact = str.match(/^(\d{2})(\d{2})(\d{2}|\d{4})$/);
                if (compact) {
                        const month = parseInt(compact[1], 10) - 1;
                        const day = parseInt(compact[2], 10);
                        let year = parseInt(compact[3], 10);

                        if (compact[3].length === 2) {
                                year = 2000 + year;
                        }

                        const compactDate = new Date(year, month, day);
                        if (
                                compactDate.getFullYear() === year &&
                                compactDate.getMonth() === month &&
                                compactDate.getDate() === day
                        ) {
                                return compactDate;
                        }
                }

                let candidate = str;
                if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                        candidate = str + "T00:00:00";
                } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
                        candidate = str + ":00";
                }

                let parsed = new Date(candidate);
                if (Number.isNaN(parsed.getTime())) {
                        parsed = new Date(str.replace(/-/g, "/"));
                }
                if (Number.isNaN(parsed.getTime())) {
                        return null;
                }
                return parsed;
        },

        /**
         * Determine if a parsed follow-up date carries a meaningful time component.
         * Usage: const hasTime = DateUtil.HasFollowUpTime(rawValue, parsedDate);
         */
        HasFollowUpTime(rawValue, date) {
                if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;

                const str = (rawValue || "").trim();
                if (!str) {
                        return !(date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0);
                }

                if (/(\d{1,2}:\d{2})/.test(str) || /(am|pm)/i.test(str)) {
                        if ((/T00:00/.test(str) || /\b00:00\b/.test(str)) && date.getHours() === 0 && date.getMinutes() === 0) {
                                return false;
                        }
                        return true;
                }

                return !(date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0);
        }



};

function GetMonthName(dt) {
	return new Date(dt).toLocaleString('en', { month: 'long' });
}

function GetFriendlyHour(hour) {
	let ap = "AM";
	if (hour > 11) { ap = "PM"; }
	if (hour > 12) { hour = hour - 12; }
	if (hour == 0) { hour = 12; }

	return hour + " " + ap;
}

function GetToday() {
	let dates = new Array(2);
	date_now = new Date();
	dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);
	return dates;
}

function GetYesterday() {
	let dates = new Array(2);
	date_now = new Date();
	date_now.setDate(date_now.getDate() + -1);
	dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);
	return dates;
}

function GetThisWeek() {
	//Lunes - Domingo
	let dates = new Array(2);
	date_now = new Date();
	let dayOfWeek = date_now.getDay();
	if (dayOfWeek == 0) {
		date_now.setDate(date_now.getDate() + -6);
		dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);

	}
	else {
		dayOfWeek = dayOfWeek - 1;
		date_now.setDate(date_now.getDate() + -dayOfWeek);
		dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);
	}

	date_now.setDate(date_now.getDate() + 6);
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);
	return dates;
}

function GetLastWeek() {
	//Lunes - Domingo
	let dates = new Array(2);
	date_now = new Date();
	date_now.setDate(date_now.getDate() + -7);
	let dayOfWeek = date_now.getDay();
	if (dayOfWeek == 0) {
		date_now.setDate(date_now.getDate() + -6);
		dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);

	}
	else {
		dayOfWeek = dayOfWeek - 1;
		date_now.setDate(date_now.getDate() + -dayOfWeek);
		dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);
	}

	date_now.setDate(date_now.getDate() + 6);
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);
	return dates;
}

function SubtractDay(NumberDays) {
	let dates = new Array(2);
	date_now = new Date();
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);
	date_now.setDate(date_now.getDate() + -NumberDays);
	dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);

	return dates;
}

function GetLast7Days() {
	return SubtractDay(6);
}
function GetLast30Days() {
	return SubtractDay(29);
}
function GetLast60Days() {
	return SubtractDay(59);
}
function GetLast90Days() {
	return SubtractDay(89);
}
function GetThisMonth() {
	let dates = new Array(2);
	date_now = new Date();
	dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), 1, 0, 0, 0, 0);
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);
	return dates;
}
function GetLastMonth() {
	let dates = new Array(2);
	date_now = new Date();
	date_now.setMonth(date_now.getMonth() + -1);
	dates[0] = new Date(Date.UTC(date_now.getUTCFullYear(), date_now.getUTCMonth(), 1, 0, 0, 0, 0));
	dates[1] = new Date(Date.UTC(date_now.getUTCFullYear(), date_now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
	return dates;
}

function GetQuarter(quarter, year) {
	let dates = new Array(2);

	switch (quarter) {
		case 1:
			dates[0] = new Date(year, 0, 1, 0, 0, 0, 0);
			dates[1] = new Date(year, 2, 31, 23, 59, 59, 999);
			break;
		case 2:
			dates[0] = new Date(year, 3, 1, 0, 0, 0, 0);
			dates[1] = new Date(year, 5, 30, 23, 59, 59, 999);
			break;
		case 3:
			dates[0] = new Date(year, 6, 1, 0, 0, 0, 0);
			dates[1] = new Date(year, 8, 30, 23, 59, 59, 999);
			break;
		case 4:
			dates[0] = new Date(year, 9, 1, 0, 0, 0, 0);
			dates[1] = new Date(year, 11, 31, 23, 59, 59, 999);
			break;
	}


	return dates;
}
function GetThisQuarter() {
	let month = new Date().getMonth();
	let intQuarter = 0;
	if (month >= 0 && month <= 2)
		intQuarter = 1;
	else if (month >= 3 && month <= 5)
		intQuarter = 2;
	else if (month >= 6 && month <= 8)
		intQuarter = 3;
	else if (month >= 9 && month <= 11)
		intQuarter = 4;
	return GetQuarter(intQuarter, new Date().getFullYear());
}
function GetLastQuarter() {
	let month = new Date().getMonth();
	let year = new Date().getFullYear();
	let intQuarter = 0;
	if (month >= 0 && month <= 2) {
		intQuarter = 4;
		year = year - 1;
	}
	else if (month >= 3 && month <= 5)
		intQuarter = 1;
	else if (month >= 6 && month <= 8)
		intQuarter = 2;
	else if (month >= 9 && month <= 11)
		intQuarter = 3;

	return GetQuarter(intQuarter, year);
}

function GetThisYear() {
	let dates = new Array(2);
	date_now = new Date();
	dates[0] = new Date(date_now.getFullYear(), 0, 1, 0, 0, 0, 0);
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);
	return dates;
}

function GetLastYear() {
	let dates = new Array(2);
	date_now = new Date();
	dates[0] = new Date(date_now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
	dates[1] = new Date(date_now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
	return dates;
}

function SubtractRangeOfdays(NumberDays1, NumberDays2) {
	let dates = new Array(2);
	date_now = new Date();
	date_now.setDate(date_now.getDate() + -NumberDays1);
	dates[0] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 0, 0, 0, 0);
	date_now = new Date();
	date_now.setDate(date_now.getDate() + -NumberDays2);
	dates[1] = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), 23, 59, 59, 999);

	return dates;
}

function GetLast31to60Days() {
	return SubtractRangeOfdays(31, 60);
}
function GetLast61to90Days() {
	return SubtractRangeOfdays(61, 90);
}

function SetToday() {
	FillFields(GetToday(), 'Get Today');
}

function SetYestesday() {
	FillFields(GetYestesday(), 'Get Yesterday');
}
function SetThisWeek() {
	FillFields(GetThisWeek(), 'Get this week');
}

function SetLastWeek() {
	FillFields(GetLastWeek(), 'Get last week');
}

function SetLast7Days() {
	FillFields(GetLast7Days(), 'Get last 7 days');
}
function SetThisMonth() {
	FillFields(GetThisMonth(), 'Get This Month');
}
function SetLastMonth() {
	FillFields(GetLastMonth(), 'Get Last Month');
}
function FillFields(dates, operation) {
	document.getElementById('txtBegin').value = dates[0];
	document.getElementById('txtEnds').value = dates[1];
	document.getElementById('Operation').innerHTML = operation;
}
function SetLast30Days() {
	FillFields(GetLast30Days(), 'Get last 30 days');
}

function SetLast60Days() {
	FillFields(GetLast60Days(), 'Get last 60 days');
}

function SetLast90Days() {
	FillFields(GetLast90Days(), 'Get last 90 days');
}
function SetThisQuarter() {
	FillFields(GetThisQuarter(), 'Get this quarter');
}
function SetLastQuarter() {
	FillFields(GetLastQuarter(), 'Get last quarter');
}
function SetLastYear() {
	FillFields(GetLastYear(), 'Get last year');
}
function SetThisYear() {
	FillFields(GetThisYear(), 'Get this year');
}
function SetLast31to60Days() {
	FillFields(GetLast31to60Days(), 'Get Last 31 to 60 Days');
}
function SetLast61to90Days() {
	FillFields(GetLast61to90Days(), 'Get Last 61 to 90 Days');
}


function GetDateByShortCut(sShortCut) {
	let dates = [new Date(), new Date()];

	if (StringUtil.EqualNoCase(sShortCut, "Today"))
		dates = GetToday();
	else if (StringUtil.EqualNoCase(sShortCut, "Yesterday"))
		dates = GetYesterday();
	else if (StringUtil.EqualNoCase(sShortCut, "This Week"))
		dates = GetThisWeek();
	else if (StringUtil.EqualNoCase(sShortCut, "Last 7 days"))
		dates = GetLast7Days();
	else if (StringUtil.EqualNoCase(sShortCut, "Last Week"))
		dates = GetLastWeek();
	else if (StringUtil.EqualNoCase(sShortCut, "This Month"))
		dates = GetThisMonth();
	else if (StringUtil.EqualNoCase(sShortCut, "Last Month"))
		dates = GetLastMonth();
	else if (StringUtil.EqualNoCase(sShortCut, "Last 30 Days"))
		dates = GetLast30Days();
	else if (StringUtil.EqualNoCase(sShortCut, "Last 60 Days"))
		dates = GetLast60Days();
	else if (StringUtil.EqualNoCase(sShortCut, "Last 90 Days"))
		dates = GetLast90Days();
	else if (StringUtil.EqualNoCase(sShortCut, "This Quarter"))
		dates = GetThisQuarter();
	else if (StringUtil.EqualNoCase(sShortCut, "Last Quarter"))
		dates = GetLastQuarter();
	else if (StringUtil.EqualNoCase(sShortCut, "This Year"))
		dates = GetThisYear();
	else if (StringUtil.EqualNoCase(sShortCut, "Last Year"))
		dates = GetLastYear();

	return dates;
}