(function (window) {
    var STORAGE_KEY = "helpbits_leaves_v1";

    function pad(num) {
        return num < 10 ? "0" + num : String(num);
    }

    function safeText(value) {
        return (value || "").toString();
    }

    function monthShort(index) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[index] || "";
    }

    function parseDateString(dateValue) {
        if (!dateValue) {
            return null;
        }
        var parts = dateValue.split("-");
        if (parts.length === 3) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        var date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
    }

    function formatDateForTable(dateValue) {
        var date = parseDateString(dateValue);
        if (!date) {
            return "";
        }
        return pad(date.getDate()) + "-" + monthShort(date.getMonth()) + "-" + date.getFullYear();
    }

    function formatCurrentHeaderDate() {
        var now = new Date();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[now.getDay()] + ", " + monthShort(now.getMonth()) + " " + now.getDate() + ", " + now.getFullYear();
    }

    function getLeaves() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return [];
            }
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function setLeaves(leaves) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
    }

    function saveLeaveApplication(application) {
        var leaves = [application];
        setLeaves(leaves);
        return leaves;
    }

    function buildCell(text, style) {
        var td = document.createElement("td");
        td.style.borderColor = "Black";
        if (style) {
            for (var key in style) {
                if (Object.prototype.hasOwnProperty.call(style, key)) {
                    td.style[key] = style[key];
                }
            }
        }
        td.textContent = text;
        return td;
    }

    function renderLeavesTable() {
        var table = document.getElementById("ctl00_ContentPlaceHolder1_DG1");
        if (!table) {
            return;
        }

        var tbody = table.getElementsByTagName("tbody")[0];
        if (!tbody || !tbody.rows || tbody.rows.length === 0) {
            return;
        }

        while (tbody.rows.length > 1) {
            tbody.deleteRow(1);
        }

        var leaves = getLeaves();
        var latestLeave = leaves.length ? leaves[0] : null;
        if (!latestLeave) {
            return;
        }

        for (var i = 0; i < 1; i++) {
            var leave = latestLeave;
            var row = document.createElement("tr");
            row.setAttribute("align", "left");
            row.setAttribute("valign", "middle");
            row.style.fontSize = "0.8rem";

            row.appendChild(buildCell(String(i + 1)));
            row.appendChild(buildCell(safeText(leave.id)));
            row.appendChild(buildCell(safeText(leave.name).toUpperCase()));
            row.appendChild(buildCell(safeText(leave.hostel)));
            row.appendChild(buildCell(safeText(leave.room)));
            row.appendChild(buildCell(formatDateForTable(leave.departureDate)));
            row.appendChild(buildCell(formatDateForTable(leave.returnDate)));
            row.appendChild(buildCell(safeText(leave.reason)));

            row.appendChild(
                buildCell("Approved", {
                    color: "DarkGreen",
                    fontWeight: "bold"
                })
            );

            row.appendChild(buildCell(formatDateForTable(leave.appliedOn)));

            var actionTd = buildCell("");
            var actionLink = document.createElement("a");
            actionLink.href = "javascript:void(0)";
            var actionBold = document.createElement("b");
            actionBold.textContent = "View Details";
            actionLink.appendChild(actionBold);
            actionTd.appendChild(actionLink);
            row.appendChild(actionTd);

            var downloadTd = buildCell("");
            var wrapDiv = document.createElement("div");
            wrapDiv.id = "leave_approval_" + i;
            var downloadLink = document.createElement("a");
            downloadLink.href = safeText(leave.pdfDataUrl) || "#";
            downloadLink.target = "_blank";
            downloadLink.download = (safeText(leave.id) || "leave") + ".pdf";
            var dlBold = document.createElement("b");
            dlBold.textContent = "Download Leave Approval";
            downloadLink.appendChild(dlBold);
            wrapDiv.appendChild(downloadLink);
            downloadTd.appendChild(wrapDiv);
            row.appendChild(downloadTd);

            tbody.appendChild(row);
        }
    }

    function updateHeaderDate() {
        var el = document.getElementById("ctl00_lbl_current_date");
        if (el) {
            el.textContent = formatCurrentHeaderDate();
        }
    }

    function updateWelcomeName() {
        var leaves = getLeaves();
        if (!leaves.length) {
            return;
        }
        var name = safeText(leaves[0].name).toUpperCase();
        var el = document.getElementById("ctl00_Name");
        if (el && name) {
            el.textContent = name;
        }
    }

    function generateTxnId() {
        return "txn-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
    }

    function initStatusPage() {
        updateHeaderDate();
        updateWelcomeName();
        renderLeavesTable();
    }

    window.HelpBitsLeaves = {
        getLeaves: getLeaves,
        saveLeaveApplication: saveLeaveApplication,
        formatDateForTable: formatDateForTable,
        generateTxnId: generateTxnId,
        initStatusPage: initStatusPage
    };
})(window);
