var HelpBitsApply = (function () {
  var wardens = {
    "Shankar Bhawan": "Sharad Shrivastava",
    "Krishna Bhawan": "Prof. Bibhas Ranjan Sarkar",
    "Srinivasa Ramanujan Bhawan": "Prof. Bibhas Ranjan Sarkar",
    "Gandhi Bhawan": "Nitin Chaturvedi",
    "Vishwakarma Bhawan": "Krishnendra Shekhawat",
    "Meera Bhawan": "Surekha Bhanot",
    "Vyas Bhawan": "Kumar Sankar Bhattacharya",
    "Ram Bhawan": "Praveen Kumar A.V.",
    "Budh Bhawan": "MM Pandey"
  };

  function getValue(id) {
    var el = document.getElementById(id);
    return el ? (el.value || "").trim() : "";
  }

  function toBase64(uint8Array) {
    var binary = "";
    var len = uint8Array.length;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return window.btoa(binary);
  }

  function downloadDataUrl(fileName, dataUrl) {
    var link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function formatLongDate(dateValue) {
    var date = new Date(dateValue + "T00:00:00");
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return date.getDate() + "-" + months[date.getMonth()] + "-" + date.getFullYear();
  }

  async function buildPdfBytes(payload) {
    var PDFDocument = PDFLib.PDFDocument;
    var StandardFonts = PDFLib.StandardFonts;
    var rgb = PDFLib.rgb;

    var pdfDoc = await PDFDocument.create();
    var page = pdfDoc.addPage([595.28, 841.89]);
    var font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    var bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("LEAVE APPLICATION", { x: 210, y: 790, size: 20, font: bold, color: rgb(0, 0, 0) });
    page.drawText("BITS Pilani - Student Welfare Division", { x: 165, y: 770, size: 11, font: font, color: rgb(0, 0, 0) });

    var y = 720;
    var gap = 28;

    function write(label, value) {
      page.drawText(label, { x: 70, y: y, size: 12, font: bold, color: rgb(0, 0, 0) });
      page.drawText(String(value || ""), { x: 250, y: y, size: 12, font: font, color: rgb(0, 0, 0) });
      y -= gap;
    }

    write("BITS ID", payload.id);
    write("Name", payload.name.toUpperCase());
    write("Contact", payload.contact);
    write("Hostel", payload.hostel);
    write("Room No.", payload.room);
    write("Warden", wardens[payload.hostel] || "");
    write("Departure Date", formatLongDate(payload.departureDate));
    write("Return Date", formatLongDate(payload.returnDate));
    write("Reason", payload.reason);
    write("Applied On", formatLongDate(payload.appliedOn));

    page.drawText("This leave approval slip is system generated.", {
      x: 70,
      y: y - 20,
      size: 10,
      font: font,
      color: rgb(0.2, 0.2, 0.2)
    });

    return await pdfDoc.save();
  }

  async function applyLeave() {
    var payload = {
      id: getValue("ID"),
      name: getValue("name"),
      contact: getValue("contact"),
      room: getValue("room"),
      hostel: getValue("hostel"),
      departureDate: getValue("DEPARTURE"),
      returnDate: getValue("RETURN"),
      reason: getValue("reason"),
      appliedOn: new Date().toISOString().slice(0, 10)
    };

    if (!payload.id || !payload.name || !payload.contact || !payload.room || !payload.departureDate || !payload.returnDate || !payload.reason) {
      alert("Please fill all fields before generating leave PDF.");
      return;
    }

    var dep = new Date(payload.departureDate + "T00:00:00");
    var ret = new Date(payload.returnDate + "T00:00:00");
    if (ret.getTime() < dep.getTime()) {
      alert("Return date cannot be before departure date.");
      return;
    }

    var btn = document.getElementById("applyLeaveButton");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "GENERATING...";
    }

    try {
      var pdfBytes = await buildPdfBytes(payload);
      var base64 = toBase64(pdfBytes);
      var dataUrl = "data:application/pdf;base64," + base64;

      payload.txnId = window.HelpBitsLeaves.generateTxnId();
      payload.pdfDataUrl = dataUrl;

      window.HelpBitsLeaves.saveLeaveApplication(payload);
      downloadDataUrl(payload.id + ".pdf", dataUrl);
      window.location.href = "index.html";
    } catch (e) {
      alert("Unable to generate leave PDF. Please try again.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "GENERATE";
      }
    }
  }

  return {
    applyLeave: applyLeave
  };
})();
