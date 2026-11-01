/**
 * KCS Utility Module: form_validation
 * ------------------------------------------------------------
 * Collection of string scrubbing helpers used by MasterPage and other
 * modules to normalise user input. They strip unwanted characters,
 * enforce numeric formats, and provide consistent masking for money,
 * phone numbers, ZIP codes, and percentages.
 *
 * Key helpers
 *  - Clean(value, allowedCharacters)
 *      Low-level filter invoked by all other functions.
 *  - StringToMoney(value)
 *      Converts raw user input into a currency-formatted string.
 *  - StringToPhone(value)
 *      Applies `(###) ###-####` or `###-####` formatting when possible.
 *
 * Usage example – sanitise before sending to the server:
 * ```js
 * const payload = BlindUnbind(_$("editForm"));
 * payload.Zip = Clean(payload.Zip, "0123456789");
 * payload.Phone = StringToPhone(payload.Phone);
 * JsonMethod.call("/Contacts.aspx", "Save", payload, refreshPage);
 * ```
 */
function Clean(sText, sAllowed) {
        let sClean = "";

	if (null != sText) {
		sText = sText.toString();
                for (let i = 0; i < sText.length; i++) {
                        if (sAllowed.indexOf(sText.charAt(i)) != -1)
                                sClean += sText.charAt(i);
                }
        }

	return sClean;
}

function CleanInt(sText) {
	return Clean(sText, "-0123456789");
}

function CleanDouble(sText) {
	return Clean(sText, "-0123456789.");
}

function StringToZip(sText) {
        let sClean = Clean(sText, "0123456789");
        sClean = StringUtil.PadLeft(sClean, "0", 5);
	
	if (sClean.length == 9)	//Zip + 4
		sClean = sClean.substr(0, 5) + "-" + sClean.substr(5, 4);
	return sClean;
}

function StringToPhone(sText) {
        let sClean = Clean(sText, "0123456789");
	if (sClean.length == 10)
		sClean = "(" + sClean.substr(0, 3) + ") " + sClean.substr(3, 3) + "-" + sClean.substr(6, 4);
	else if (sClean.length == 7)
		sClean = sClean.substr(0, 3) + "-" + sClean.substr(3, 4);
	return sClean;
}


function StringToPercent(sText) {
	const iDecimals = 2;
	let sClean = CleanDouble(sText);
	if (sClean.length == 0)
		sClean = "0";

	const iPos = sClean.indexOf(".");
	if (iPos >= 0 && iPos < sClean.length - iDecimals)
		sClean = sClean.substr(0, iPos + iDecimals + 1);

	return sClean;
}


function StringToMoney(n) {
        const sClean = CleanDouble(n);
        n = parseFloat(sClean);
	if (isNaN(n))
		n=0;

	const formatter=new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',

		// These options are needed to round to whole numbers if that's what you want.
		//minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
		//maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
	});

	return formatter.format(n);
}

function StringToInteger(n) {
        const sClean = CleanInt(n);
        n = parseInt(sClean);
        if (isNaN(n))
                n = 0;
	return n;
}



function StringToDecimal(val) {
        if (null == val)
                return null;

        let sClean = CleanDouble(val);
        if (sClean.length == 0)
                sClean = 0;
        return Number(sClean).toLocaleString('en-US');
}


function FormatZip(oVar) {
        const sText = oVar.value;
	oVar.value = StringToZip(sText);
}

function FormatPhone(oVar) {
        const sText = oVar.value;
	oVar.value = StringToPhone(sText);
}

function FormatPercent(oVar) {
        const sText = oVar.value;

	oVar.value = StringToPercent(sText);
}

function isNum(iValue) {
        const sValue = iValue;
        if (!sValue || sValue.length === 0)
                return false;

        let start = 0;
        const ch0 = sValue.charAt(0);
        if (ch0 === '-' || ch0 === '$') {
                start = 1;
        } else if (ch0 !== '.' && (ch0 < '0' || ch0 > '9')) {
                return false;
        }

        let seenDecimal = (ch0 === '.');

        for (let i = start; i < sValue.length; i++) {
                const ch = sValue.charAt(i);
                if (ch === '.') {
                        if (seenDecimal)
                                return false;
                        seenDecimal = true;
                        continue;
                }
                if (ch < '0' || ch > '9') {
                        return false;
                }
        }

        return true;
}

function FormatMoney(oVar) {
        const n = oVar.value;
	oVar.value = StringToMoney(n);
}

function FormatNumber(oVar) {
        const sText = oVar.value;
        let sClean = CleanInt(sText);

        if (sClean.length == 0)
                sClean = "0";

        oVar.value = sClean;
}

function MaxLength(oVar, iLength) {
	if (oVar && oVar.value.length > iLength)
		oVar.value = oVar.value.substring(0, iLength);
}

function FormatDate(data) {
        if (data == null) return "";

       const d = new Date(data);

       if (isNaN(d.getTime())) return "";

        const sTime = (d.toLocaleTimeString().replace(/:[0-9]{2} /, " "));

	return d.toDateString() + " " + sTime;

}

function FormatDateShort(data) {
        if (data == null) return "";

       const d = new Date(data);

       if (isNaN(d.getTime())) return "";

        return d.toDateString();
}

function FormatDateCalendar(data) {

       if (data == null || data == '') return "";
       const date = new Date(data);

       if (isNaN(date.getTime())) return "";

       return (date.getMonth() + 1).toString() + "/" + date.getDate().toString() + "/" + date.getFullYear().toString();
}

