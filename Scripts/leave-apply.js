const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib;

async function modifyPdf() {
    // Fetch an existing PDF document
    const url = 'leave.pdf';
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed the Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    var ID = document.getElementById("ID");
    var name = document.getElementById("name");
    var contact = document.getElementById("contact");
    var room = document.getElementById("room");
    var hostel = document.getElementById("hostel");
    var reason = document.getElementById("reason");
    var departureInput = document.getElementById("DEPARTURE");
    var returnInput = document.getElementById("RETURN");
    var departure = departureInput.valueAsNumber;
    var returnn = returnInput.valueAsNumber;
    var returnndate = new Date(returnn);
    var departuredate = new Date(departure);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var wardenByHostel = {
        'Shankar Bhawan': 'Sharad Shrivastava',
        'Krishna Bhawan': 'Prof. Bibhas Ranjan Sarkar',
        'Srinivasa Ramanujan Bhawan': 'Prof. Bibhas Ranjan Sarkar',
        'Gandhi Bhawan': 'Nitin Chaturvedi',
        'Vishwakarma Bhawan': 'Krishnendra Shekhawat',
        'Meera Bhawan': 'Surekha Bhanot',
        'Vyas Bhawan': 'Kumar Sankar Bhattacharya',
        'Ram Bhawan': 'Praveen Kumar A.V.',
        'Budh Bhawan': 'MM Pandey'
    };

    if (!ID.value || !name.value || !contact.value || !room.value || !reason.value || !departureInput.value || !returnInput.value) {
        alert('Please fill all fields before generating leave PDF.');
        return;
    }

    if (returnn < departure) {
        alert('Return date cannot be before departure date.');
        return;
    }

    // Get the width and height of thne first page
    const { width, height } = firstPage.getSize();
    console.log(width, height);
    firstPage.drawText(ID.value, {
        x: 302,
        y: 710,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    firstPage.drawText(name.value.toUpperCase(), {
        x: 302,
        y: 688,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    firstPage.drawText(contact.value, {
        x: 302,
        y: 667,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    firstPage.drawText(hostel.value, {
        x: 302,
        y: 647,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    firstPage.drawText(room.value, {
        x: 302,
        y: 627,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    firstPage.drawText(wardenByHostel[hostel.value] || '', {
        x: 302,
        y: 607,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    firstPage.drawText(departuredate.getDate().toString() + '-' + months[departuredate.getMonth()] + '-' + departuredate.getFullYear().toString(), {
        x: 302,
        y: 587,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    firstPage.drawText(returnndate.getDate().toString() + '-' + months[returnndate.getMonth()] + '-' + returnndate.getFullYear().toString(), {
        x: 302,
        y: 567,
        size: 12.2,
        font: helveticaFont,
        color: rgb(0, 0, 0)
    });
    const pdfBytes = await pdfDoc.save();

    var binary = '';
    for (var i = 0; i < pdfBytes.length; i++) {
        binary += String.fromCharCode(pdfBytes[i]);
    }
    var base64 = window.btoa(binary);
    var pdfDataUrl = 'data:application/pdf;base64,' + base64;

    if (window.HelpBitsLeaves) {
        window.HelpBitsLeaves.saveLeaveApplication({
            id: ID.value,
            name: name.value,
            contact: contact.value,
            room: room.value,
            hostel: hostel.value,
            reason: reason.value,
            departureDate: departureInput.value,
            returnDate: returnInput.value,
            appliedOn: new Date().toISOString().slice(0, 10),
            txnId: window.HelpBitsLeaves.generateTxnId(),
            pdfDataUrl: pdfDataUrl
        });
    }

    alert('Leave application submitted successfully. You can download the approval PDF from the Leaves Status page.');

    setTimeout(function () {
        window.location.href = 'index.html';
    }, 150);
}
